import React from 'react';
import ListItem from './ListItem';
import PlaceholderItem from './PlaceholderItem';
import PropTypes from 'prop-types';

const List = (props) => {
  const [canDrag, setCanDrag] = React.useState(true);

  const updateCanDrag = (flag) => {
    setCanDrag(flag);
  };

  return (
    <ul className="structure-list" data-testid="list">
      {props.items.map((item, i) => {
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
            canDrag={canDrag}
            setCanDrag={updateCanDrag}
          />
        );
      })}
    </ul>
  );
};

List.propTypes = {
  items: PropTypes.array,
};

export default List;
