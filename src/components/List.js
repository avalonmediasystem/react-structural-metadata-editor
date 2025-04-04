import React from 'react';
import ListItem from './ListItem';
import PlaceholderItem from './PlaceholderItem';
import PropTypes from 'prop-types';

const List = ({ items }) => {
  return (
    <>
      {items.map((item, i) => {
        if (!item) {
          return null;
        }
        if (item.type === 'optional') {
          return <PlaceholderItem key={i} item={item} />;
        }
        return (
          <ListItem
            key={item.id}
            item={item}
          >
            {
              item.items?.length > 0 && (
                <ul data-testid='list'>
                  <List items={item.items} />
                </ul>
              )
            }
          </ListItem>
        );
      })}
    </>
  );
};

List.propTypes = {
  items: PropTypes.array,
};

export default List;
