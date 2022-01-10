import React, { Component } from 'react';
import { Button, ButtonToolbar, Row, Col } from 'react-bootstrap';
import { connect, useSelector, useDispatch } from 'react-redux';
import { configureAlert } from '../services/alert-status';
import { retrieveStreamMedia, setAlert } from '../actions/forms';
import VolumeSlider from './Slider';
import LoadingSpinner from '../services/LoadingSpinner';

// Content of aria-label for UI components
const waveformLabel = `Two interactive waveforms, plotted one after the other using data from a masterfile in a back-end server.
There are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below.`;
const zoomViewLabel = `A detailed portion of the waveform data, the level of details shown can be changed with zoom in/out buttons in the waveform toolbar`;
const overViewLabel = `An overview of the waveform data of the media file used. This shows all the time-based segments from the structure`;

const Waveform = React.forwardRef((props, ref) => {
  const streamMediaStatus = useSelector(
    (state) => state.forms.streamInfo.streamMediaStatus
  );
  const readyPeaks = useSelector((state) => state.peaksInstance.readyPeaks);
  const peaksInstance = useSelector((state) => state.peaksInstance);
  const editingDisabled = useSelector((state) => state.forms.editingDisabled);
  const dispatch = useDispatch();

  const [audioFile, setAudioFile] = React.useState(props.audioStreamURL);
  const [volume, setVolume] = React.useState(100);
  const [peaksIsReady, setPeaksIsReady] = React.useState(readyPeaks);

  /* Ref to access changes in 'editingDisabled' state variable from 
  redux within the eventhandler for 'keydown' event */
  const editingRef = React.useRef(editingDisabled);
  const setEditing = (e) => {
    editingRef.current = e;
  };

  React.useEffect(() => {
    setAudioFile(props.audioStreamURL);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  React.useEffect(() => {
    setEditing(editingDisabled);
  }, [editingDisabled]);

  React.useEffect(() => {
    setPeaksIsReady(readyPeaks);

    if (readyPeaks) {
      dispatch(
        retrieveStreamMedia(audioFile, ref.mediaPlayerRef.current, {
          withCredentials: props.withCredentials,
        })
      );

      // Add a listener to keydown event
      document.addEventListener('keydown', handleKeyPress);
    }
  }, [readyPeaks]);

  React.useEffect(() => {
    if (streamMediaStatus) {
      const alert = configureAlert(streamMediaStatus);
      dispatch(setAlert(alert));
    }
  }, [streamMediaStatus]);

  const handleKeyPress = (event) => {
    // When structure is not being edited play/pause audio when spacebar is pressed
    if (event.keyCode == 32 && !editingRef.current) {
      event.preventDefault();
      ref.mediaPlayerRef.current.paused ? playAudio() : pauseAudio();
    }
  };

  const zoomIn = () => {
    peaksInstance.peaks.zoom.zoomIn();
  };

  const zoomOut = () => {
    peaksInstance.peaks.zoom.zoomOut();
  };

  const playAudio = () => {
    peaksInstance.peaks.player.play();
  };

  const pauseAudio = () => {
    peaksInstance.peaks.player.pause();
  };

  const adjustVolume = (volume) => {
    ref.mediaPlayerRef.current.volume = volume / 100;
    setVolume(volume);
  };

  const { streamMediaError, streamMediaLoading } = useSelector(
    (state) => state.forms.streamInfo
  );
  const stillLoading =
    (streamMediaLoading && !streamMediaError) || !peaksIsReady;
  return (
    <React.Fragment>
      <div
        id="waveform-container"
        tabIndex="0"
        data-testid="waveform"
        aria-label={waveformLabel}
      >
        <div
          id="zoomview-container"
          ref={ref.zoomViewRef}
          tabIndex="0"
          data-testid="zoomview-view"
          aria-label={zoomViewLabel}
        />
        <div
          id="overview-container"
          ref={ref.overViewRef}
          tabIndex="0"
          data-testid="overview-view"
          aria-label={overViewLabel}
        />
      </div>
      {stillLoading && (
        <div data-testid="loading-spinner">
          <LoadingSpinner isLoading={stillLoading} />
        </div>
      )}
      <audio
        ref={ref.mediaPlayerRef}
        hidden={true}
        controls="controls"
        data-testid="waveform-media"
        src={audioFile}
      >
        Your browser does not support the audio element.
      </audio>
      {!streamMediaLoading && !streamMediaError && (
        <Row data-testid="waveform-toolbar">
          <Col xs={6} md={6}>
            <VolumeSlider volume={volume} setVolume={adjustVolume} />
          </Col>
          <Col xs={12} md={6}>
            <ButtonToolbar>
              <Button
                className="glyphicon glyphicon-play"
                aria-label="Play"
                onClick={playAudio}
                data-testid="waveform-play-button"
                disabled={streamMediaError || streamMediaLoading}
              />
              <Button
                className="glyphicon glyphicon-pause"
                aria-label="Pause"
                onClick={pauseAudio}
                data-testid="waveform-pause-button"
                disabled={streamMediaError || streamMediaLoading}
              />
              <Button
                className="glyphicon glyphicon-zoom-in"
                aria-label="Zoom in"
                onClick={zoomIn}
                data-testid="waveform-zoomin-button"
              />
              <Button
                className="glyphicon glyphicon-zoom-out"
                aria-label="Zoom out"
                onClick={zoomOut}
                data-testid="waveform-zoomout-button"
              />
            </ButtonToolbar>
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
});

export default Waveform;
