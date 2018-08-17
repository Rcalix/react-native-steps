import { AsyncStorage } from 'react-native';
import { TRY_AUTH, AUTH_SET_TOKEN } from './actionTypes';
import {uiStartLoading, uiStopLoading} from './index';
import startMainTabs from '../../screens/MainTabs/startMainTabs';
// import { parse } from 'querystring';
// import { DESTRUCTION } from 'dns';
// import { AsyncSubject } from 'rx';
// import { resolve } from 'dns';

export const tryAuth = (authData, authMode) => {
    return dispatch => {
      console.log(authMode);
      dispatch(uiStartLoading());
      const apiKey = "AIzaSyCuQxF8yUrUcAVG88IdTJIjVhHjquSj5Ds"
      let url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=" + apiKey;
      if (authMode === 'signup') {
       url = "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=" +apiKey;
      }
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
            email: authData.email,
            password: authData.password,
            returnSecureToken: true
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .catch(err => {
        console.log(err);
        alert("Authentication failed, please try again!");
        dispatch(uiStopLoading());
    })
    .then(res => res.json())
    .then(parsedRes => {
      dispatch(uiStopLoading());
          console.log(parsedRes);
          if (!parsedRes.idToken) {
            console.log(parsedRes.error)
            alert('Authentication failed, please try again! ' + parsedRes.error);
          }
          else {
            console.log('login start !!!!!');
            dispatch(authStoreToken(parsedRes.idToken, parsedRes.expiresIn));
            startMainTabs();
          }
    });
    };
};

export const authStoreToken = (token, expiresIn) => {
    return dispacth => {
        console.log('AuthStoreToken Store');
        dispacth(authSetToken(token));
        const now  = new Date();
        const expiryDate = now.getDate() + expiresIn * 1000;
        AsyncStorage.setItem("ap:auth:token", token);
        AsyncStorage.setItem("ap:auth:expiryDate", expiryDate.toString());
    }
}
export const authSetToken = token => {
    return {
        type: AUTH_SET_TOKEN,
        token: token
    }
};

export const authGetToken = () => {
    return (dispatch, getState) => {
        const promise = new Promise((resolve, reject) => {
            const token = getState().auth.token;
            if (!token) {
                let fetchedToken;
                AsyncStorage.getItem("ap:auth:token")
                    .catch(err => reject())
                    .then(tokenFromStorage => {
                        fetchedToken = tokenFromStorage;
                        if (!tokenFromStorage) {
                            reject();
                            return;
                        }
                        return AsyncStorage.getItem("ap:auth:expiryDate");

                    })
                    .then(expiryDate => {
                        const parsedExpiryDate = new Date(expiryDate);
                        const now = new Date();
                        if (parsedExpiryDate > now) {
                            dispatch(authSetToken(fetchedToken));
                            resolve(fetchedToken);
                        } else {
                            console.log('reject!!!!! expirydate');
                            reject();
                        }
                    })
                    .catch(err => reject());
            } else {
                resolve(token);
            }
        });
        promise.catch(err => {
            dispatch(authClearStorage());
        });
        return promise
    };
};

export const authAutoSignIn = () => {
    return dispacth => {
        dispacth(authGetToken())
        .then(token => {
            startMainTabs();
        }).catch(err => console.log("Failed to fectch token!"));
    }
}

export const authClearStorage  = () => {
    return dispatch => {
    AsyncStorage.removeItem("ap:auth:token");
    AsyncStorage.removeItem("ap:auth:expiryDate");
    }
}