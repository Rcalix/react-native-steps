import { SET_PLACES, REMOVE_PLACE } from './actionTypes';
import {uiStartLoading, uiStopLoading } from './index';

export const addPlace = (placeName, location, image) => {
    return dispatch => {
      dispatch(uiStartLoading());
      fetch('https://us-central1-reactnativeapp-6d6da.cloudfunctions.net/storeImage', {
          method: 'POST',
          body: JSON.stringify({
              image: image.base64
          })
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
    .catch(err => console.log(err))
    .then(res => res.json())
    .then(parsedRes => {
        dispatch(uiStopLoading());
         console.log(parsedRes);
    });
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
        fetch('https://reactnativeapp-6d6da.firebaseio.com/places.json')
        .catch(err => {
            alert("Something wen wRONG");
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
        });
    }
}

export const deletePlace = (key) => {
    return dispatch => {
        dispatch(removePLace(key));
        fetch('https://reactnativeapp-6d6da.firebaseio.com/places/' + key + '.json', {
            method:"DELETE"
        }).catch(err => {
            alert('Something went wrong')
            console.log(err);
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