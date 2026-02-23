import { Button, TextField, useTheme } from "@mui/material";
import { useState } from "react";

interface AddListModalContent {
  add: (name: string) => void
  cancel: () => void
}

export const AddListModalContent = ({ add, cancel }: AddListModalContent) => {
  const [state, setState] = useState('')
  const theme = useTheme()
  return (
    <>
      <h2 id="child-modal-title">Creating To Do List</h2>
      <span>Please add a name for your new To DO List</span>
      <TextField sx={{
        ".modal & .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.text.contrastText,
        },
        ".modal & .Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main,
        },
        ".modal & .MuiInputLabel-root": {
          color: theme.palette.text.contrastText,
        },
        ".modal & .MuiInputLabel-root.Mui-focused": {
          color: theme.palette.primary.main,
        },
        ".modal & .MuiOutlinedInput-input": {
          color: theme.palette.text.contrastText,
        },
      }} id="To-Do-Name" value={state} label="To Do Name" variant="outlined" onChange={({ target: { value } }) => setState(value)} />
      <div className="button-wrapper">
        <Button variant="contained" onClick={() => add(state)}>Add</Button>
        <Button variant="contained" color="secondary" onClick={cancel}>Cancel</Button>
      </div>
    </>

  )
}