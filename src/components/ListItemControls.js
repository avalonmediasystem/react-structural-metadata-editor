import React, { Component } from 'react';
import { Button, ButtonToolbar, Overlay, Popover } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { handleEditingTimespans } from '../actions/forms';

const styles = {
  buttonToolbar: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  popover: {
    width: '250px',
    height: 'auto'
  }
};

class ListItemControls extends Component {
  static propTypes = {
    handleShowDropTargetsClick: PropTypes.func,
    handleEditClick: PropTypes.func,
    handleDelete: PropTypes.func,
    item: PropTypes.shape({
      childrenCount: PropTypes.number,
      label: PropTypes.string.isRequired,
      type: PropTypes.string
    })
  };

  state = {
    deleteMessage: '',
    showDeleteConfirm: false,
    target: null
  };

  enableEditing() {
    // Enable editing of other list items
    this.props.handleEditingTimespans(0);
  }

  handleConfirmDelete = () => {
    this.props.handleDelete();
    this.enableEditing();
    this.setState({ deleteMessage: '', showDeleteConfirm: false });
  };

  handleDeleteClick = e => {
    const { childrenCount, label } = this.props.item;
    let deleteMessage = `Are you sure you'd like to delete <strong>${label}</strong>`;

    if (childrenCount > 0) {
      deleteMessage += ` and it's <strong>${childrenCount}</strong> child items`;
    }
    deleteMessage += `?`;

    // Disable editing of other list items
    this.props.handleEditingTimespans(1);

    this.setState({
      deleteMessage,
      showDeleteConfirm: true,
      target: e.target
    });
  };

  cancelDeleteClick = e => {
    this.enableEditing();
    this.setState({
      showDeleteConfirm: false
    });
  };

  render() {
    const {
      handleShowDropTargetsClick,
      handleEditClick,
      item,
      forms
    } = this.props;
    const { deleteMessage, showDeleteConfirm } = this.state;

    return (
      <div className="edit-controls-wrapper" data-testid="list-item-controls">
        {item.type === 'span' && (
          <Button
            bsStyle="link"
            disabled={forms.editingDisabled && !item.active}
            onClick={handleShowDropTargetsClick}
            data-testid="list-item-dnd-btn"
          >
            <FontAwesomeIcon icon="dot-circle" />
          </Button>
        )}
        <Button
          bsStyle="link"
          onClick={handleEditClick}
          disabled={forms.editingDisabled}
          data-testid="list-item-edit-btn"
        >
          <FontAwesomeIcon icon="pen" />
        </Button>

        {item.type !== 'root' && (
          <React.Fragment>
            <Button
              bsStyle="link"
              onClick={this.handleDeleteClick}
              disabled={forms.editingDisabled}
              data-testid="list-item-delete-btn"
            >
              <FontAwesomeIcon icon="trash" />
            </Button>
            <Overlay
              show={showDeleteConfirm}
              target={this.state.target}
              placement="left"
              container={this}
            >
              <Popover
                id="popover-contained"
                title="Confirm delete?"
                style={styles.popover}
                data-testid="delete-confirmation-popup"
              >
                <p
                  dangerouslySetInnerHTML={{ __html: deleteMessage }}
                  data-testid="delete-confirmation-message"
                />
                <ButtonToolbar style={styles.buttonToolbar}>
                  <Button
                    bsStyle="danger"
                    bsSize="xsmall"
                    onClick={this.handleConfirmDelete}
                    data-testid="delete-confirmation-confirm-btn"
                  >
                    Delete
                  </Button>
                  <Button
                    bsSize="xsmall"
                    onClick={this.cancelDeleteClick}
                    data-testid="delete-confirmation-cancel-btn"
                  >
                    Cancel
                  </Button>
                </ButtonToolbar>
              </Popover>
            </Overlay>
          </React.Fragment>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  handleEditingTimespans: code => dispatch(handleEditingTimespans(code))
});

const mapStateToProps = state => ({
  forms: state.forms
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListItemControls);
