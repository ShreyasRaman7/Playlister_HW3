import {useContext} from 'react'
import { GlobalStoreContext } from '../store'

function DeleteListModal(){
    console.log("entered delete list modal") ;
    const {store} = useContext(GlobalStoreContext);
    let name = "";
    if(store.currentList){
        name = store.currentList.name;
    }
    function handleDeleteList(event){
        store.deleteMarkedList();
    }
    function handleCloseModal(event){
        store.hideDeleteList();
    }

    return (
        <div
            className="modal"

            id="delete-list-modal"
            data-animation="slideInOutLeft">
            <div className="modal-dialog">
                <header className="dialog-header">
                    Delete the {name} Playlist?
                </header>
                <div id="confirm-cancel-container">
                    <button
                        id="dialog-yes-button"
                        className="modal-button"
                        onClick={handleDeleteList}
                    >Confirm</button>
                    <button
                        id="dialog-no-button"
                        className="modal-button"
                        onClick={handleCloseModal}
                    >Cancel</button>
                </div>
            </div>
        </div>
    );
}
export default DeleteListModal;