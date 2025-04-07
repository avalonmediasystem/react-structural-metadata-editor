import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeLow, faVolumeHigh, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import Button from 'react-bootstrap/Button';

export default function Slider({ setVolume, volume }) {
  const [prevValue, setPrevValue] = useState(100);
  const sliderRef = useRef(null);

  // Set the initial volume progress when the component mounts
  useEffect(() => {
    updateVolumeProgress(volume);
  }, []);

  const handleChange = (e) => {
    updateVolumeProgress(e.target.value, e.target.max);
  };

  /**
   * Toggle volume between 0 and previous value when clicked on mute/unmute button
   */
  const onToggle = () => {
    if (volume == 0) {
      updateVolumeProgress(prevValue);
    } else {
      setPrevValue(volume);
      updateVolumeProgress(0);
    }
  };

  /**
   * Update volume in the parent component and set styling for the current
   * volume in the slider
   * @param {Number} value current value of the slider
   */
  const updateVolumeProgress = (value) => {
    const progress = (value / 100) * 100;
    sliderRef.current.style.background
      = `linear-gradient(to right, #000000 ${progress}%, #9d9d9d ${progress}%)`;
    setVolume(value);
  };

  return (
    <div className='volume-slider'>
      <Button onClick={onToggle}>
        {volume > 50
          ? <FontAwesomeIcon icon={faVolumeHigh} />
          : volume == 0
            ? <FontAwesomeIcon icon={faVolumeMute} /> : <FontAwesomeIcon icon={faVolumeLow} />
        }
      </Button>
      <input type='range' className='volume-slider-range' min='0' max='100'
        value={volume} onChange={handleChange} ref={sliderRef} />
    </div>
  );
}
