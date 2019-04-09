import React from 'react';
import ListItem from './ListItem';
import PlaceholderItem from './PlaceholderItem';

var List = function List(props) {
  return React.createElement(
    'ul',
    { className: 'structure-list' },
    props.items.map(function (item, i) {
      if (!item) {
        return null;
      }
      if (item.type === 'optional') {
        return React.createElement(PlaceholderItem, { key: i, item: item });
      }
      return React.createElement(ListItem, { key: item.id, item: item });
    })
  );
};

export default List;