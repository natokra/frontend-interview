
import { IconButton, useTheme } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { AddListModalContent } from '../addListModalContent/addListModalContent';
import { useTodo } from '../../context/TodoContext';
import { useModal } from '../../context/ModalContext';
import { useCtxTheme } from '../../context/ThemeContext';
import Card from '../card/card';
import "./styles.css"

export const PageLayout = () => {
    const { todoLists, addList } = useTodo()
    const { openModal, closeModal } = useModal()
    const theme = useTheme()
    const { setTheme, theme: ctxTheme } = useCtxTheme()

    const handleButtonClick = (value: string) => {
        addList(value)
        closeModal()
    }

    const handleAddListButton = () => {
        openModal({
            ariaLabel: "modal-To-Do-List",
            ariaDescribedBy: "modal-Add-To-Do-List-With-Name",
            content: <AddListModalContent add={handleButtonClick} cancel={closeModal} />,
        })
    }

    const handleThemeToggle = () => {
        if (ctxTheme === 'dark') setTheme('light')
        else setTheme('dark')
    }
    return (
        <>
            <div className="page-layout-wrapper">
                <h1 style={{ color: theme.palette.text.primary }}>To-Do Lists</h1>
                <div className='page-layout-buttons'>
                    <IconButton onClick={handleAddListButton}>
                        <AddCircleRoundedIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={handleThemeToggle}>
                        {ctxTheme === 'light' ?
                            <DarkModeIcon sx={{ color: theme.palette.text.primary }} /> : <LightModeIcon />
                        }
                    </IconButton>
                </div>
            </div>
            {todoLists.map((todoList) => <Card key={todoList.id} todoItems={todoList.todoItems} name={todoList.name} id={todoList.id} />)}
        </>
    )
}