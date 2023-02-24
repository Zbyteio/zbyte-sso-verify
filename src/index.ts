/**
 *
 * MIT License
 *
 * Copyright (c) 2019 OECD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import axios from 'axios';
import { prop, path, find, compose, flip, curryN } from 'ramda';
import jwkToPem = require('jwk-to-pem');
import jwt = require('jsonwebtoken');
const cache = {};

const verifyOnline =
  ({ realm, authServerUrl }) =>
  (accessToken, options = {}) =>
    axios
      .get(
        // @ts-ignore
        `${authServerUrl}/realms/${options.realm || realm}/protocol/openid-connect/userinfo`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      .then(prop('data'))
      // @ts-ignore
      .then(makeUser);

const makeUser = ({ sub, preferred_username, email_verified, resource_access, email, name, ...others }) => ({
  id: sub,
  userName: preferred_username,
  emailVerified: email_verified,
  resourceAccess: resource_access,
  email,
  name,
  ...others,
});

const verify = curryN(2)(jwt.verify);

const isTheRightKid = (kid) => (publicKey) => publicKey.kid === kid;

const findPublicKeyFromKid = (publicKey) => (kid) => find(isTheRightKid(kid))(publicKey);

const getKid = path(['header', 'kid']);

const decode = compose(curryN(2), flip)(jwt.decode);

const getUserFromPublicKey = (token) => compose(makeUser, verify(token));

const getUserFromJWK = (token) => (jwk) =>
  compose(getUserFromPublicKey(token), jwkToPem, findPublicKeyFromKid(jwk), getKid, decode({ complete: true }))(token);

const fetchPublicKeys = ({ realm, authServerUrl, useCache }) => {
  const url = `${authServerUrl}/realms/${realm}/protocol/openid-connect/certs`;
  const key = url;
  if (useCache) {
    return cache[key]
      ? Promise.resolve(cache[key])
      : axios
          .get(url)
          .then(path(['data', 'keys']))
          .then((publicKey) => {
            cache[key] = publicKey;
            return publicKey;
          });
  } else {
    return axios.get(url).then(path(['data', 'keys']));
  }
};

const verifyOffline =
  (config) =>
  async (accessToken, options = {}) => {
    const { publicKey } = config;
    return publicKey
      ? getUserFromPublicKey(accessToken)(publicKey)
      : fetchPublicKeys({ ...config, ...options }).then(getUserFromJWK(accessToken));
  };

const Keycloak = (config) => ({
  verifyOnline: verifyOnline(config),
  verifyOffline: verifyOffline(config),
});

export default Keycloak;
