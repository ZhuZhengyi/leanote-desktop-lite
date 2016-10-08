import * as types from '../constants/ActionTypes';
import { fetchNotes } from '../actions/NoteActions';

export function receiveNotebooks(status, value) {
  return { type: types.RECEIVE_NOTEBOOKS, status, value };
}

export function fetchNotebooks() {
  return (dispatch) => {
    service.notebook.getNotebooks((res) => {
      dispatch(receiveNotebooks('success', res));
    });
  };
}

export function selectNotebook(notebookId) {
  return (dispatch) => {
    // TODO 时序先后问题
    dispatch(fetchNotes(notebookId)).then(() => {
      dispatch({ type: types.SELECT_NOTEBOOK, value: notebookId });      
    });
  }
}