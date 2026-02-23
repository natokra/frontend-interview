import { Button } from "@mui/material";
import "./styles.css"

interface AreYouSureModalContentProps {
    text: string;
    accept: () => void
    cancel: () => void
}

export const AreYouSureModalContent = ({text, accept, cancel}: AreYouSureModalContentProps) => {
    return (
        <>
            <h2 id="child-modal-title">Are you sure you want to delete {text}?</h2>
            <div className="button-wrapper">
                <Button variant="contained" color="primary" onClick={accept}>Accept</Button>
                <Button variant="contained" color="secondary" onClick={cancel}>Cancel</Button>
            </div>
        </>
    )
}