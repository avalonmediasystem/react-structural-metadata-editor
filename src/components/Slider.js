/**
 * NOTE:
 * The logic of turning on/off volume in this module is taken from,
 * https://github.com/digirati-co-uk/timeliner/blob/master/src/components/VolumeSliderCompact/VolumeSliderCompact.js
 *
 */
import React from 'react';
import Slider from '@material-ui/lab/Slider';
import VolumeUp from '@material-ui/icons/VolumeUp';
import VolumeOff from '@material-ui/icons/VolumeOff';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Paper } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { Row, Col } from 'react-bootstrap';

const useStyles = makeStyles({
  root: {
    width: 200,
    padding: 20
  }
});

const StyledSlider = withStyles({
  thumb: {
    height: 12,
    width: 12,
    backgroundColor: '#000',
    border: '2px solid #000',
    '&$focused, &:hover': {
      boxShadow: `0px 0px 0px ${8}px ${fade('#000', 0.16)}`
    },
    '&$activated': {
      boxShadow: `0px 0px 0px ${8 * 1.5}px ${fade('#000', 0.16)}`
    },
    '&$jumped': {
      boxShadow: `0px 0px 0px ${8 * 1.5}px ${fade('#000', 0.16)}`
    }
  },
  track: {
    backgroundColor: '#000',
    height: 2,
    float: 'left'
  },
  trackAfter: {
    backgroundColor: '#787D81'
  },
  focused: {},
  activated: {},
  jumped: {}
})(Slider);

function VolumeSlider(props) {
  const SPEAKER_ICON_SIZE = {
    width: 20,
    height: 20
  };
  const classes = useStyles();
  const [prevValue, setPrevValue] = React.useState(100);

  const handleChange = (e, value) => {
    props.setVolume(value);
  };

  const onToggle = () => {
    const { volume, setVolume } = props;
    if (volume === 0) {
      setVolume(prevValue);
    } else {
      setPrevValue(volume);
      setVolume(0);
    }
  };

  return (
    <Paper className={classes.root}>
      <Row>
        <Col xs={1} md={1}>
          <div onClick={onToggle} style={{ margin: -9 }}>
            {props.volume === 0 ? (
              <VolumeOff
                style={{ ...SPEAKER_ICON_SIZE, transform: 'translateX(1px)' }}
              />
            ) : (
              <VolumeUp
                style={{ ...SPEAKER_ICON_SIZE, transform: 'translateX(1px)' }}
              />
            )}
          </div>
        </Col>
        <Col xs={10} md={10}>
          <StyledSlider value={props.volume} onChange={handleChange} />
        </Col>
      </Row>
    </Paper>
  );
}

export default VolumeSlider;
