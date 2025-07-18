import React, { forwardRef, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPause,
  faPlay,
  faSearchMinus,
  faSearchPlus,
} from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  setStreamMediaLoading,
  streamMediaSuccess,
} from '../actions/forms';
import Slider from './Slider';
import LoadingSpinner from '../services/LoadingSpinner';

// Content of aria-label for UI components
const waveformLabel = `Two interactive waveforms, plotted one after the other using data from a masterfile in a back-end server.
There are time-based visual sections plotted in these 2 waveforms representing each timespan in the structure below.`;
const zoomViewLabel = `A detailed portion of the waveform data, the level of details shown can be changed with zoom in/out buttons in the waveform toolbar`;
const overViewLabel = `An overview of the waveform data of the media file used. This shows all the time-based segments from the structure`;

const Waveform = forwardRef(({ }, ref) => {
  // State variables from global state
  const mediaInfo = useSelector((state) => state.manifest.mediaInfo);
  const readyPeaks = useSelector((state) => state.peaksInstance.readyPeaks);
  const peaksInstance = useSelector((state) => state.peaksInstance.peaks);
  const editingDisabled = useSelector((state) => state.forms.editingDisabled);
  const { streamMediaError, streamMediaLoading } = useSelector(
    (state) => state.forms.streamInfo
  );
  // Dispatch actions
  const dispatch = useDispatch();
  const mediaLoading = (value) => dispatch(setStreamMediaLoading(value));
  const mediaSuccess = () => dispatch(streamMediaSuccess());

  const [audioFile, setAudioFile] = useState(mediaInfo.src);
  const [volume, setVolume] = useState(100);
  const [stillLoading, setStillLoading] = useState();

  /* Ref to access changes in 'editingDisabled' state variable from 
  redux within the eventhandler for 'keydown' event */
  const editingRef = useRef(editingDisabled);
  const setEditing = (e) => {
    editingRef.current = e;
  };

  useEffect(() => {
    // Add an event listener to keydown event
    document.addEventListener('keydown', handleKeyPress);

    // Remove event listener when component is unmounting
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    let isLoading = streamMediaLoading || !readyPeaks;
    setStillLoading(isLoading);
  }, [streamMediaLoading, readyPeaks]);

  useEffect(() => {
    if (mediaInfo.src === undefined) {
      mediaLoading(0);
    } else if (!mediaInfo.isStream) {
      setAudioFile(mediaInfo.src);
    }
  }, [mediaInfo]);

  useEffect(() => {
    setEditing(editingDisabled);
  }, [editingDisabled]);

  const handleKeyPress = (event) => {
    if (event.target.nodeName == 'INPUT') return;
    // When structure is not being edited play/pause audio when spacebar is pressed
    if (event.keyCode == 32 && !editingRef.current) {
      event.preventDefault();
      ref.mediaPlayerRef.current.paused ? playAudio() : pauseAudio();
    }
  };

  const handleCanplay = () => {
    mediaSuccess();
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

  return (
    <React.Fragment>
      <Row className="waveform-row">
        <Col lg={mediaInfo.isVideo ? 8 : 12} sm={8}>
          <div
            id="waveform-container"
            className={streamMediaError ? "disabled" : ""}
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
        </Col>
        {stillLoading && (
          <div data-testid="loading-spinner">
            <LoadingSpinner isLoading={stillLoading} />
          </div>
        )}
        <Col lg={4} sm={4} className="waveform-media">
          {mediaInfo.isVideo
            ? (
              <video
                ref={ref.mediaPlayerRef}
                controls={false}
                data-testid="waveform-video-player"
                src={audioFile || null}
                onCanPlay={handleCanplay}
              >
                Your browser does not support the video element.
              </video>
            )
            : (
              <audio
                ref={ref.mediaPlayerRef}
                hidden={true}
                controls="controls"
                data-testid="waveform-audio-player"
                src={audioFile || null}
                onCanPlay={handleCanplay}
              >
                Your browser does not support the audio element.
              </audio>
            )
          }
        </Col>
      </Row>
      {!streamMediaLoading && !streamMediaError && (
        <Row data-testid="waveform-toolbar">
          <Col sm={6} md={6}>
            <Slider volume={volume} setVolume={adjustVolume} />
          </Col>
          <Col sm={6} md={6} className="mt-1">
            <ButtonToolbar>
              <Button
                variant="outline-secondary"
                aria-label="Play"
                onClick={playAudio}
                data-testid="waveform-play-button"
                disabled={streamMediaError || streamMediaLoading}
                className="me-1"
              >
                <FontAwesomeIcon icon={faPlay} />
              </Button>
              <Button
                variant="outline-secondary"
                aria-label="Pause"
                onClick={pauseAudio}
                data-testid="waveform-pause-button"
                disabled={streamMediaError || streamMediaLoading}
                className="me-1"
              >
                <FontAwesomeIcon icon={faPause} />
              </Button>
              <Button
                variant="outline-secondary"
                aria-label="Zoom in"
                onClick={zoomIn}
                data-testid="waveform-zoomin-button"
                className="me-1"
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
