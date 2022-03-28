import React, { Component } from 'react';
import axios from 'axios';
// const envDot= require('dotenv').config()
import { Map, GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
const mapStyles = {
    width: '80%',
    height: '80%'
};

export class MapContainer extends Component {
    constructor(props) {
        super(props);
        this.onMarkerClick = this.onMarkerClick.bind(this);
        // this.onMouseoverMarker = this.onMouseoverMarker.bind(this);
        this.fetchPlaces = this.fetchPlaces.bind(this);
        this.onClose = this.onClose.bind(this);
        // this.mapClicked = this.mapClicked.bind(this);

        // this.centerMoved = this.centerMoved.bind(this);
        // this.onBoundsChanged = this.onBoundsChanged.bind(this);
        this.state = {
            showingInfoWindow: false,
            activeMarker: {},
            selectedPlace: {},
            places: [],
            bounds: {},
            cardData: [],
            center: {
                lat: '',
                lng: ''
            },
            location: "Salmon Falls Resort- 16707 N. Tongas Hwy, PO Box 5700 Ketchikan AK USA"
        };
    }


    onMarkerClick(props, marker, e) {

        this.setState({
            location: props.address,
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true,
            center: {
                lat: props.position.lat,
                lng: props.position.lng
            },
            places: []
        });
        console.log(props.address);

    }
    onClose = props => {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null,
                places: {}
            });
        }
    };
    handleGeoCodeApi = async () => {
        
        const { data } = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.location}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`);
        this.setState({
            center: {
                lat: data.results[0].geometry.location.lat,
                lng: data.results[0].geometry.location.lng
            }
        })
    }
 
    async componentDidMount() {
         await this.handleGeoCodeApi();
    }
    async componentDidUpdate(prevProps, prevState) {
        if (prevState.location !== this.state.location) {
            await this.handleGeoCodeApi();
        }
    }
    async fetchPlaces(mapProps, map) {

        const { google } = mapProps;
        const service = new google.maps.places.PlacesService(map);
        if (this.state.center) {
            await service.nearbySearch({
                // location: { lat: 40.639829, lng: -74.5896178 },
                location: { lat: this.state.center.lat, lng: this.state.center.lng },
                radius: 10000,
                type: ['lodging']
            }, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    console.log(results)
                    for (let i = 0; i < results.length; i++) {
                        let places = results[i];
                        console.log(places.name)

                        let hotel = {
                            name: places.name,
                            lat: places.geometry.location.lat(),
                            lng: places.geometry.location.lng(),
                            placeId: places.place_id,
                            rating: places.rating,
                            priceLevel: places.price_level,
                            address: places.vicinity,
                            photo: places.photos?.map(photo => photo.getUrl({ maxWidth: 300, maxHeight: 300 }))[0]
                        }
                        this.setState({
                            cardData: [...this.state.cardData, hotel]
                        })


                        // console.log(places,"places");

                    }

                }

            });
        }

    }
    onMapClicked = (mapProps, map, clickEvent) => {

        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null
            })
        }
    }

    // centerMoved(mapProps, map) {
    //     console.log(mapProps);
    //     console.log(map); 
    //   }
    render() {

        // var bounds = new this.props.google.maps.LatLngBounds();
        // console.log(this.state.cardData)

        return (
            <>
                {this.state.location && this.state.center.lng && this.state.center.lat && <Map
                    google={this.props.google}
                    zoom={14}
                    style={mapStyles}
                    initialCenter={this.state.center}
                    // onClick={this.onMapClicked}
                    onReady={this.fetchPlaces}
                // onBoundsChanged={this.onBoundsChanged}
                // onCenterChanged={this.centerMoved}
                >
                    {this.state.cardData.map((hotel, index) => {
                        return (
                            <Marker
                                key={index}
                                onClick={this.onMarkerClick}
                                // onClick={this.onMarkerClick}
                                position={{ lat: hotel.lat, lng: hotel.lng }}
                                name={hotel.name}
                                address={hotel.address}
                                rating={hotel.rating}
                                priceLevel={hotel.priceLevel}
                                photo={hotel.photo}

                            />
                        )
                    })}
                    {this.state.showingInfoWindow && <InfoWindow
                        marker={this.state.activeMarker}
                        visible={this.state.showingInfoWindow}
                        onClose={this.onClose}
                    >
                        <div>

                            <h4>{this.state.selectedPlace.name}</h4>
                            <img src={this.state.selectedPlace.photo} alt="hotel" />
                            <p>{this.state.selectedPlace.address}</p>
                            <p>{this.state.selectedPlace.rating}</p>
                            <p>{this.state.selectedPlace.priceLevel}</p>
                        </div>
                    </InfoWindow>}
                </Map>}


            </>
        );
    }
}




export default GoogleApiWrapper({

    apiKey: process.env.REACT_APP_GOOGLE_API_KEY
})(MapContainer);
