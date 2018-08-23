import { SET_PLACES, REMOVE_PLACE, PLACE_ADDED, START_ADD_PALCE } from './actionTypes';
import {uiStartLoading, uiStopLoading, authGetToken  } from './index';

export const startAddPlace = () => {
    return {
        type: START_ADD_PALCE
    }
}
export const addPlace = (placeName, location, image) => {
    return dispatch => {
        let authToken;
        dispatch(uiStartLoading());
        dispatch(authGetToken())
        .then(token => {
           authToken = token;
           return fetch('https://us-central1-reactnativeapp-6d6da.cloudfunctions.net/storeImage', {
                method: 'POST',
                body: JSON.stringify({
                    image: image.base64
                }),
                headers: {
                    "Authorization": "Bearer " + authToken
                }
            })
        })
        .catch(err => {
            alert("somthing went wrong ");
            console.log(err);
            dispatch(uiStopLoading());
        })
      .catch(err => {
          console.log(err)
          alert("some error appear");
          dispatch(uiStopLoading());
        })
      .then(res => res.json())
      .then(parsedRes => {
        const placeData = {
            name: placeName,
            location: location,
            image: parsedRes.imageUrl
        };
        return  fetch('https://reactnativeapp-6d6da.firebaseio.com/places.json?auth=' + authToken, {
            method:"POST",
            body: JSON.stringify(placeData)
        })
     })
    .then(res => res.json())
    .then(parsedRes => {
        dispatch(uiStopLoading());
        dispatch(placeAdded());
         console.log(parsedRes);
    })
    .catch(err => console.log(err));
    };
};

export const setPlaces = (places) => {
    return {
        type: SET_PLACES,
        places: places
    }
}

export const placeAdded = () => {
    return {
        type: PLACE_ADDED
    }
}
export const getPlaces = () => {
    return dispatch => {
        dispatch(authGetToken())
            .then(token => {
                return fetch('https://reactnativeapp-6d6da.firebaseio.com/places.json?auth='+ token)
            })
            .catch((err) => {
                alert("Something went wRONG");
                console.log(err)
            })
            .then(res => res.json())
            .then(parsedRes => {
                const places = [];
                for (let key in parsedRes) {
                    places.push({
                        ...parsedRes[key],
                        image: {
                            uri: parsedRes[key].image
                        },
                        key: key
                    });
                }
                dispatch(setPlaces(places));
            }).catch(err => {
                alert("somthing went wrong ");
                console.log(err);
            });
    }
}

export const removePlace = key  => {
    return {
        type: REMOVE_PLACE,
        key: key
    }
}
export const deletePlace = key => {
    return dispatch => {
      dispatch(authGetToken())
        .catch(() => {
          alert("No valid token found!");
        })
        .then(token => {
          dispatch(removePlace(key));
          return fetch(
            "https://reactnativeapp-6d6da.firebaseio.com/places/" +
              key +
              ".json?auth=" +
              token,
            {
              method: "DELETE"
            }
          );
        })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error();
          }
        })
        .then(parsedRes => {
          console.log("Done!");
        })
        .catch(err => {
          alert("Something went wrong, sorry :/");
          console.log(err);
        });
    };
  };

