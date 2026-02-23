import { useState } from "react";
import { Checkbox, FormControl, IconButton, InputLabel, OutlinedInput, Tooltip, useTheme } from "@mui/material"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import "./styles.css"
import { useTodo } from "../../context/TodoContext";
import { useModal } from "../../context/ModalContext";
import { AreYouSureModalContent } from "../areYouSureModalContent/areYouSureModalContent";
import { useSortable } from "@dnd-kit/react/sortable";

interface CardItemProps {
    checked: boolean
    text: string
    ids: { list: number, item: number }
    index: number
}

export const CardItem = ({ text, checked, ids, index }: CardItemProps) => {
    const { removeItem, toggleItem, updateItem } = useTodo();
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const { openModal, closeModal } = useModal();
    const theme = useTheme();
    const { ref, handleRef } = useSortable({
        id: `${ids.list}-${ids.item}`,
        index,
    });

    const handleEditButtonClick = () => {
        setEditing(ctx => !ctx);
        setEditText(text);
    }

    const handleEdition = () => {
        updateItem(ids.list, ids.item, { name: editText })
        setEditing(false);
    }

    const handleDismissEdition = () => {
        setEditing(false)
        setEditText('')
    }

    const handleDelete = () => {
        removeItem(ids.list, ids.item)
        closeModal()
    }

    const handleDeleteClick = () => {
        openModal({
            ariaLabel: "modal-remove",
            ariaDescribedBy: "modal-remove-to-do-task",
            content: <AreYouSureModalContent cancel={closeModal} accept={handleDelete} text={text} />,
        })
    }

    return (
        <div className="card-item" ref={ref}>
            <div className="card-item-check-wrapper">
                {!editing && <Checkbox
                    checked={checked}
                    onChange={() => toggleItem(ids.list, ids.item)}
                    slotProps={{
                        input: { 'aria-label': 'controlled' },
                    }}
                />}
                {editing ? (
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel htmlFor={`${ids.item}-outlined-card-item-text`}>Edit the task name</InputLabel>
                        <OutlinedInput
                            id={`${ids.item}-outlined-card-item-text`}
                            value={editText}
                            onChange={({ target: { value } }) => setEditText(value)}
                            onKeyDown={({ code }) => {
                                if (code === "Enter") {
                                    handleEdition()
                                }
                            }}
                            label="Edit the task name"
                        />
                    </FormControl>
                ) : <span
                    className={`card-item-text ${checked ? 'card-item-text-line-through' : ''}`}
                    style={{ color: theme.palette.text.primary }} >
                    {text}
                </span>}
            </div>
            <div className="card-item-action-wrapper">


                {editing ? (<>
                    <Tooltip title="Accept">
                        <IconButton aria-label="accept" onClick={handleEdition}>
                            <DoneIcon color="primary" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                        <IconButton aria-label="dismiss" onClick={(handleDismissEdition)}>
                            <CloseIcon color="secondary" />
                        </IconButton>
                    </Tooltip>
                </>) : (<>
                    <Tooltip title="Edit">
                        <IconButton aria-label="edit" onClick={handleEditButtonClick}>
                            <EditIcon color="primary" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton aria-label="delete" onClick={handleDeleteClick}>
                            <DeleteIcon color="secondary" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Drag">
                        <IconButton aria-label="drag" ref={handleRef} aria-labelledby="drag" >
                            <DragHandleIcon color="action" />
                        </IconButton>
                    </Tooltip>
                </>)}
            </div>
        </div>
    )
}