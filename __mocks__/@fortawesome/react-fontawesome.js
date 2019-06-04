/**
 * Reference: https://github.com/FortAwesome/react-fontawesome/issues/154
 */
import React from 'react';

export function FontAwesomeIcon(props) {
  return <i className={`fa ${props.icon}`} />;
}