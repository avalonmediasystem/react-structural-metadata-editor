import React from 'react';
import ListItem from './ListItem';
import { mount } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

const mockStore = configureMockStore([thunk]);

describe('ListItem component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({});
  });
  test('renders ListItem without crashing without a metadata item', () => {
    const wrapper = mount(
      <Provider store={store}>
        <ListItem />
      </Provider>
    );
    expect(wrapper.find('LisItemControls')).toBeDefined();
    expect(wrapper.find('ListItemEditForm')).toBeDefined();
  });
  test('renders ListItem without crashing with a metadata item', () => {
    let item = {
      type: 'span',
      label: 'Segment 1.1',
      id: '123a-456b-789c-3d',
      begin: '00:00:03.32',
      end: '00:00:10.32'
    };
    const wrapper = mount(
      <Provider store={store}>
        <ListItem key={item.id} item={item} />
      </Provider>
    );
    expect(wrapper.find(ListItem).instance().props.item).toEqual(item);
  });
});
