import { useState } from "react"
import { TodoItem } from "../../hooks/useTodoList"
import "./styles.css"
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, useTheme } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { useTodo } from "../../context/TodoContext";
import { AreYouSureModalContent } from "../areYouSureModalContent/areYouSureModalContent";
import { useModal } from "../../context/ModalContext";
import { CardItem } from "../cardItem/cardItem";
import { DragDropProvider } from "@dnd-kit/react";
import { useLocalStorage } from "../../context/LocalStorageContext";

interface CardProps {
    id: number,
    name: string,
    todoItems: TodoItem[],
}

export default function Card({ name, todoItems, id }: CardProps) {
    const [value, setValue] = useState("");
    const { addItem, removeList, updateList } = useTodo();
    const { openModal, closeModal } = useModal();
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const theme = useTheme()
    const { setListOrdering } = useLocalStorage()

    const handleEditButtonClick = () => {
        setEditing(ctx => !ctx);
        setEditText(name);
    }

    const handleEdition = () => {
        updateList(id, { name: editText })
        setEditing(false);
    }

    const handleDismissEdition = () => {
        setEditing(false)
        setEditText('')
    }

    const handleDelete = () => {
        removeList(id)
        closeModal()
    }

    const handleDeleteClick = () => {
        openModal({
            ariaLabel: "modal-remove",
            ariaDescribedBy: "modal-remove-to-do-list",
            content: <AreYouSureModalContent cancel={closeModal} accept={handleDelete} text={name} />,
        })
    }

    const handleDragEnd = (event: any) => {
        const { source, target } = event.operation;
        if (!source || !target) return;

        const sourceIndex = source.sortable?.initialIndex;
        const targetIndex = target.sortable?.index;

        if (sourceIndex === undefined || targetIndex === undefined) return;
        if (sourceIndex === targetIndex) return;

        const reordered = [...todoItems];
        const [removed] = reordered.splice(sourceIndex, 1);
        reordered.splice(targetIndex, 0, removed);

        setListOrdering(id, reordered.map(item => item.id));
    };

    return (
        <div className="card" style={{ borderColor: theme.palette.background.contrastBackground }}>
            <div className="card-header" style={{ backgroundColor: theme.palette.background.contrastBackground }}>
                {editing ? (
                    <FormControl fullWidth sx={{
                        ".card-header & .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.text.contrastText,
                            color: theme.palette.text.contrastText,
                        },
                        ".card-header & .Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.text.contrastText,
                        },
                        ".card-header & .MuiInputLabel-root": {
                            color: theme.palette.text.contrastText,
                        },
                        ".card-header & .MuiInputLabel-root.Mui-focused": {
                            color: theme.palette.primary.main,
                        },
                        ".card-header & .MuiOutlinedInput-input": {
                            color: theme.palette.text.contrastText,
                        },
                    }} variant="outlined">
                        <InputLabel htmlFor={`${id}-outlined-card-title`}>Edit the list name</InputLabel>
                        <OutlinedInput
                            id={`${id}-outlined-card-title`}
                            value={editText}
                            style={{ color: theme.palette.text.contrastText }}
                            onChange={({ target: { value } }) => setEditText(value)}
                            onKeyDown={({ code }) => {
                                if (code === "Enter") {
                                    handleEdition()
                                }
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="add item"
                                        onClick={handleEdition}
                                        edge="end"
                                    >
                                        <AddIcon sx={{ color: theme.palette.text.contrastText }} />
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Edit the task name"
                        />
                    </FormControl>
                ) : <h1 style={{ color: theme.palette.text.contrastText }}>{name}</h1>}
                <div className="card-icon-button-wrapper">
                    {editing ? (
                        <>
                            <IconButton aria-label="accept" onClick={handleEdition}>
                                <DoneIcon color="primary" />
                            </IconButton>
                            <IconButton aria-label="dismiss" onClick={handleDismissEdition}>
                                <CloseIcon color="secondary" />
                            </IconButton>
                        </>
                    ) : (<>
                        <IconButton aria-label="edit" onClick={handleEditButtonClick}>
                            <EditIcon color="primary" />
                        </IconButton>
                        <IconButton aria-label="delete" onClick={handleDeleteClick}>
                            <DeleteIcon color="secondary" />
                        </IconButton>
                    </>)}

                </div>
            </div>
            <div className="card-body">
                <FormControl variant="outlined">
                    <InputLabel htmlFor={`${id}-outlined-add-your-task`}>Add your task</InputLabel>
                    <OutlinedInput
                        id={`${id}-outlined-add-your-task`}
                        value={value}
                        label="Add your task"
                        onChange={({ target: { value } }) => setValue(value)}
                        onKeyDown={({ code }) => {
                            if (code === "Enter") {
                                addItem(id, value)
                                setValue('')
                            }
                        }
                        }
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="add item"
                                    onClick={() => {
                                        addItem(id, value)
                                        setValue('')
                                    }}
                                    edge="end"
                                >
                                    <AddIcon />
                                </IconButton>
                            </InputAdornment>
                        } />
                </FormControl>
                {todoItems.length > 0 ?
                    (
                        <DragDropProvider onDragEnd={handleDragEnd}>
                            {todoItems.map((item, index) => <CardItem key={item.id} checked={item.done} text={item.name} ids={{ list: id, item: item.id }} index={index} />)}
                        </DragDropProvider>
                    )
                    : <div style={{ color: theme.palette.text.primary }}>No tasks have been entered yet</div>
                }
            </div>
        </div>
    )
}