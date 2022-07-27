import React, { Component } from 'react';
import {
  Button,
  ButtonToolbar,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import {
  handleEditingTimespans,
  updateStructureStatus,
} from '../actions/forms';
import { faPen, faTrash, faDotCircle } from '@fortawesome/free-solid-svg-icons';

const styles = {
  buttonToolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  popover: {
    width: '250px',
    height: 'auto',
  },
};

class ListItemControls extends Component {
  static propTypes = {
    handleShowDropTargetsClick: PropTypes.func,
    handleEditClick: PropTypes.func,
    handleDelete: PropTypes.func,
    item: PropTypes.shape({
      childrenCount: PropTypes.number,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
    }),
  };

  state = {
    deleteMessage: '',
    showDeleteConfirm: false,
    target: null,
  };

  enableEditing() {
    // Enable editing of other list items
    this.props.handleEditingTimespans(0);
  }

  handleConfirmDelete = () => {
    this.props.handleDelete();
    this.enableEditing();
    this.setState({ deleteMessage: '', showDeleteConfirm: false });
    // Change structureIsSaved to false
    this.props.updateStructureStatus(0);
  };

  handleDeleteClick = (e) => {
    const { childrenCount, label } = this.props.item;
    let deleteMessage = `Are you sure you'd like to delete <strong>${label}</strong>`;

    if (childrenCount > 0) {
      const puralizedItem = childrenCount > 1 ? 'items' : 'item';
      deleteMessage += ` and it's <strong>${childrenCount}</strong> child ${puralizedItem}`;
    }
    deleteMessage += `?`;

    // Disable editing of other list items
    this.props.handleEditingTimespans(1);

    this.setState({
      deleteMessage,
      showDeleteConfirm: true,
      target: e.target,
    });
  };

  cancelDeleteClick = (e) => {
    this.enableEditing();
    this.setState({
      showDeleteConfirm: false,
    });
  };

  render() {
    const { handleShowDropTargetsClick, handleEditClick, item, forms } =
      this.props;
    const { deleteMessage, showDeleteConfirm } = this.state;

    return (
      <div className="edit-controls-wrapper" data-testid="list-item-controls">
        {item.type === 'span' && (
          <Button
            variant="link"
            disabled={forms.editingDisabled && !item.active}
            onClick={handleShowDropTargetsClick}
            data-testid="list-item-dnd-btn"
          >
            <FontAwesomeIcon icon={faDotCircle} />
          </Button>
        )}
        <Button
          variant="link"
          onClick={handleEditClick}
          disabled={forms.editingDisabled}
          data-testid="list-item-edit-btn"
        >
          <FontAwesomeIcon icon={faPen} />
        </Button>

        {item.type !== 'root' && (
          <React.Fragment>
            <OverlayTrigger
              trigger="click"
              placement="left"
              show={showDeleteConfirm}
              overlay={
                <Popover data-testid="delete-confirmation-popup">
                  <Popover.Title as="h3">Confirm delete?</Popover.Title>
                  <Popover.Content>
                    <p
                      dangerouslySetInnerHTML={{ __html: deleteMessage }}
                      data-testid="delete-confirmation-message"
                    />
                    <ButtonToolbar style={styles.buttonToolbar}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={this.handleConfirmDelete}
                        data-testid="delete-confirmation-confirm-btn"
                        className="mr-1"
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={this.cancelDeleteClick}
                        data-testid="delete-confirmation-cancel-btn"
                      >
                        Cancel
                      </Button>
                    </ButtonToolbar>
                  </Popover.Content>
                </Popover>
              }
            >
              <Button
                variant="link"
                onClick={this.handleDeleteClick}
                disabled={forms.editingDisabled}
                data-testid="list-item-delete-btn"
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </OverlayTrigger>
          </React.Fragment>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  handleEditingTimespans: (code) => dispatch(handleEditingTimespans(code)),
  updateStructureStatus: (code) => dispatch(updateStructureStatus(code)),
});

const mapStateToProps = (state) => ({
  forms: state.forms,
});

export default connect(mapStateToProps, mapDispatchToProps)(ListItemControls);
