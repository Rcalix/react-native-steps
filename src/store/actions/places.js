import { SET_PLACES, REMOVE_PLACE } from './actionTypes';
import {uiStartLoading, uiStopLoading, authGetToken  } from './index';

export const addPlace = (placeName, location, image) => {
    return dispatch => {
        dispatch(authGetToken())
        .then(token => {
            dispatch(uiStartLoading());
           return fetch('https://us-central1-reactnativeapp-6d6da.cloudfunctions.net/storeImage', {
                method: 'POST',
                body: JSON.stringify({
                    image: image.base64
                })
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
        return  fetch('https://reactnativeapp-6d6da.firebaseio.com/places.json', {
            method:"POST",
            body: JSON.stringify(placeData)
        })
     })
    .then(res => res.json())
    .then(parsedRes => {
        dispatch(uiStopLoading());
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

export const deletePlace = (key) => {
    return dispatch => {
        dispatch(authGetToken())
        .catch(err => {
            alert("somthing went wrong ");
            console.log(err);
        })
        .then(token => {
            dispatch(removePLace(key));
            return  fetch('https://reactnativeapp-6d6da.firebaseio.com/places/' + key + '.json?auth=' + token, {
                    method:"DELETE"
            })
        })
        
        .then(parseRest => {
            console.log('Done');
        }); 
    }
};

export const removePLace = key  => {
    return {
        type: REMOVE_PLACE,
        key: key
    }
}