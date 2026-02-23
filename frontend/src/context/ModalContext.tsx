import { Modal, useTheme } from "@mui/material";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";


interface ModalConfig {
  content: ReactNode;
  ariaLabel: string;
  ariaDescribedBy: string;
}

interface ModalContextType {
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ModalConfig | null>(null);
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const openModal = useCallback((cfg: ModalConfig) => {
    setOpen(true)
    setConfig(cfg)
  }, []);
  const closeModal = useCallback(() => {
    setOpen(false)
    setConfig(null)
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {
        config &&
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby={config.ariaLabel}
          aria-describedby={config.ariaDescribedBy}
        >
          <div className="modal" style={{ color: theme.palette.text.contrastText, backgroundColor: theme.palette.background.contrastBackground }}>
            {config.content}
          </div>
        </Modal>
      }
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal debe usarse dentro de <ModalProvider>");
  return ctx;
}