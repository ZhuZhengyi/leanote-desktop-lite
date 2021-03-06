import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import emitter from '../util/emitter';
import { fromNow } from '../util/timeFormat';
import { httpsToLeanote } from '../util/regex';
import Link from '../components/Link';
import Menu from '../util/SystemMenu';
import MoveNoteDialogContainer from '../containers/MoveNoteDialogContainer';

class NoteListItem extends Component {
  static propTypes = {
    checked: PropTypes.bool,
    checkedNoteIds: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    deleteNote: PropTypes.func.isRequired,
    moveToNotebook: PropTypes.func.isRequired,
    note: PropTypes.shape({
      abstract: PropTypes.string,
      content: PropTypes.string,
      noteId: PropTypes.string.isRequired,
      title: PropTypes.string,
      updatedTime: PropTypes.string,
    }).isRequired,
    selected: PropTypes.bool,
    thumbnail: PropTypes.string,
    view: PropTypes.string,
    onCtrlClick: PropTypes.func,
    onShiftClick: PropTypes.func,
  };

  static defaultProps = {
    selected: false,
    view: 'snippet',
  };

  render() {
    const {
      checked,
      className,
      note,
      thumbnail,
			selected,
    } = this.props;
    return (
      <Link
        className={classNames('note-list-item', className)}
        id={this.props.id}
				to={note.noteId}
        onContextMenu={this.showMenu}
        onClick={this.handleClick}
      >
        <div className={classNames("wrapper", { selected: selected }, { checked: checked })}>
          <div className="info">
            <div className="title">{note.title ? note.title : 'Untitled'}</div>
            <div className="detail">
              <span className="updated-time">{fromNow(note.updatedTime)}</span>
              <span className="snippet">{note.abstract}</span>
            </div>
          </div>
          {this.renderThumbnail(thumbnail)}
        </div>
      </Link>
    );
  }

  renderThumbnail = (thumbnail) => {
    if (thumbnail) {
      return (
        <div
          className="thumbnail"
          style={{backgroundImage: `url(${httpsToLeanote(thumbnail)})`}}
        >
        </div>
      );
    }
    return null;
  }

  handleClick = (event) => {
    const nativeEvent = event.nativeEvent;
    if (this.props.onCtrlClick && nativeEvent.metaKey) {
      event.preventDefault();
      this.props.onCtrlClick(this.props.note);
    }
    if (this.props.onShiftClick && nativeEvent.shiftKey) {
      event.preventDefault();
      this.props.onShiftClick(this.props.note);
    }
  }

  showMenu = (event) => {
    if (!this.menu) {
      const template = [
        {
          label: 'Move to notebook',
          click: (event) => {
            const noteIds = this.getTargetNoteIds();
            let title = null;
            if (noteIds.length === 1) {
              const noteTitle = this.props.note.title ? this.props.note.title : 'Untitled';
              title = `Move "${noteTitle}"`;
            }
            else {
              title = `Move ${noteIds.length} notes`;
            }
            const callback = (msg) => {
              console.log(msg.notebookId);
              if (msg.notebookId && msg.notebookId !== this.props.note.notebookId) {
                const from = this.props.note.notebookId, to = msg.notebookId;
                noteIds.forEach((noteId) => {
                  this.props.moveToNotebook(noteId, from, to);
                });
                // console.log('msg', msg);
              }
            }
            emitter.emit('show-dialog', <MoveNoteDialogContainer callback={callback} title={title} />);
          },
        },
        {
          label: 'Delete note',
          click: (event) => {
            this.props.deleteNote(this.props.note);
          },
        }
      ];
      this.menu = new Menu(template);
    }
    this.menu.popup(event, false);
  }

  getTargetNoteIds = () => {
    if (this.props.checkedNoteIds.includes(this.props.note.noteId)) {
      return this.props.checkedNoteIds;
    }
    return [ this.props.note.noteId ];
  }
}

export default NoteListItem;
