/**
 * NOTE:
 * The logic of turning on/off volume in this module is taken from,
 * https://github.com/digirati-co-uk/timeliner/blob/master/src/components/VolumeSliderCompact/VolumeSliderCompact.js
 *
 */
import React from 'react';
import VolumeUp from '@material-ui/icons/VolumeUp';
import VolumeOff from '@material-ui/icons/VolumeOff';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Paper, Slider } from '@material-ui/core';
import { Row, Col } from 'react-bootstrap';

const useStyles = makeStyles(() => ({
  root: {
    width: 200,
    paddingLeft: 12,
    paddingRight: 25,
  },
}));

const StyledSlider = withStyles({
  root: {
    color: '#000',
    height: 1,
    marginLeft: 20,
  },
  thumb: {
    height: 12,
    width: 12,
    backgroundColor: '#000',
    border: '2px solid #000',
    '&:focus,&:hover,&$active': {
      boxShadow: '#000',
    },
  },
  active: {},
  track: {
    height: 2,
    borderRadius: 4,
    backgroundColor: '#000',
  },
  rail: {
    height: 2,
    borderRadius: 4,
    backgroundColor: '#000',
  },
})(Slider);

export default function VolumeSlider(props) {
  const SPEAKER_ICON_SIZE = {
    width: 20,
    height: 20,
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
        <Col xs={2} md={2} style={{ paddingRight: 0, paddingLeft: 5, margin: 'auto' }}>
          <div onClick={onToggle} style={{ margin: 2, paddingRight: 15 }}>
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
        <Col xs={10} md={10} style={{ paddingRight: 25, paddingLeft: 0 }}>
          <StyledSlider value={props.volume} onChange={handleChange} />
        </Col>
      </Row>
    </Paper>
  );
}
