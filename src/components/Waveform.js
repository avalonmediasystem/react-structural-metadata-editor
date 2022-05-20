import React, { Component } from 'react';
import { Button, ButtonToolbar, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPause,
  faPlay,
  faSearchMinus,
  faSearchPlus,
} from '@fortawesome/free-solid-svg-icons';
import { connect, useSelector, useDispatch } from 'react-redux';
import { configureAlert } from '../services/alert-status';
import {
  retrieveStreamMedia,
  setAlert,
  streamMediaSuccess,
} from '../actions/forms';
import VolumeSlider from './Slider';
import LoadingSpinner from '../services/LoadingSpinner';
import { getMimetype } from '../services/utils';

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
  const peaksInstance = useSelector((state) => state.peaksInstance.peaks);
  const editingDisabled = useSelector((state) => state.forms.editingDisabled);
  const dispatch = useDispatch();

  const [audioFile, setAudioFile] = React.useState(props.audioURL);
  const [volume, setVolume] = React.useState(100);
  const [peaksIsReady, setPeaksIsReady] = React.useState(readyPeaks);

  /* Ref to access changes in 'editingDisabled' state variable from 
  redux within the eventhandler for 'keydown' event */
  const editingRef = React.useRef(editingDisabled);
  const setEditing = (e) => {
    editingRef.current = e;
  };

  React.useEffect(() => {
    setAudioFile(props.audioURL);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  React.useEffect(() => {
    setEditing(editingDisabled);
  }, [editingDisabled]);

  React.useEffect(() => {
    setPeaksIsReady(readyPeaks);

    const mimeType = getMimetype(audioFile);
    // When given a .m3u8 playlist, use HLS to stream media
    if (readyPeaks && mimeType == 'application/x-mpegURL') {
      dispatch(
        retrieveStreamMedia(audioFile, ref.mediaPlayerRef.current, {
          withCredentials: props.withCredentials,
        })
      );
    } else {
      // Given a audio/video file, the HTML player handles the playback
      dispatch(streamMediaSuccess());
    }
  }, [readyPeaks]);

  React.useEffect(() => {
    if(peaksInstance?.player) {
      // Add a listener to keydown event
      document.addEventListener('keydown', handleKeyPress);
    }
  }, [peaksInstance])

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
    peaksInstance.zoom.zoomIn();
  };

  const zoomOut = () => {
    peaksInstance.zoom.zoomOut();
  };

  const playAudio = () => {
    peaksInstance.player.play();
  };

  const pauseAudio = () => {
    peaksInstance.player.pause();
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
          <Col sm={6} md={6}>
            <VolumeSlider volume={volume} setVolume={adjustVolume} />
          </Col>
          <Col sm={6} md={6} className="mt-1">
            <ButtonToolbar>
              <Button
                variant="outline-secondary"
                aria-label="Play"
                onClick={playAudio}
                data-testid="waveform-play-button"
                disabled={streamMediaError || streamMediaLoading}
                className="mr-1"
              >
                <FontAwesomeIcon icon={faPlay} />
              </Button>
              <Button
                variant="outline-secondary"
                aria-label="Pause"
                onClick={pauseAudio}
                data-testid="waveform-pause-button"
                disabled={streamMediaError || streamMediaLoading}
                className="mr-1"
              >
                <FontAwesomeIcon icon={faPause} />
              </Button>
              <Button
                variant="outline-secondary"
                aria-label="Zoom in"
                onClick={zoomIn}
                data-testid="waveform-zoomin-button"
                className="mr-1"
              >
                <FontAwesomeIcon icon={faSearchPlus} />
              </Button>
              <Button
                variant="outline-secondary"
                aria-label="Zoom out"
                onClick={zoomOut}
                data-testid="waveform-zoomout-button"
              >
                <FontAwesomeIcon icon={faSearchMinus} />
              </Button>
            </ButtonToolbar>
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
});

export default Waveform;
