import React from "react"
import { compose, withProps } from "recompose"
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

const MapWithAMarker = withScriptjs(withGoogleMap(props =>
  <GoogleMap
    defaultZoom={8}
    defaultCenter={{ lat: -34.397, lng: 150.644 }}
  >
    <Marker
      position={{ lat: -34.397, lng: 150.644 }}
    />
  </GoogleMap>
));

class ListMap extends React.PureComponent {
  state = {
    isMarkerShown: false,
  }

  componentDidMount() {
    this.delayedShowMarker()
  }

  delayedShowMarker = () => {
    setTimeout(() => {
      this.setState({ isMarkerShown: true })
    }, 3000)
  }

  handleMarkerClick = () => {
    this.setState({ isMarkerShown: false })
    this.delayedShowMarker()
  }

  render() {
    return (
      <MapWithAMarker
      googleMapURL={"https://maps.googleapis.com/maps/api/js?key= " + process.env.REACT_APP_GOOGLE_API_KEY +"&v=3.exp&libraries=geometry,drawing,places"}
      loadingElement={<div style={{ height: `100%` }} />}
      containerElement={<div style={{ height: `800px` }} />}
      mapElement={<div style={{ height: `100%` }} />}
    />
    )
  }
}

export default ListMap;