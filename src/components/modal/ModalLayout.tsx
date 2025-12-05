import { useRef } from "react";
import { createPortal } from "react-dom";
import useClickOutside from "../../hooks/useClickOutside";
import { CloseIcon } from "../icons/CloseIcon";

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function ModalLayout({
  onClose,
  children,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose, true);

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className={`relative bg-white rounded-2xl w-[90%] max-w-[600px] max-h-[90%] overflow-auto p-6 z-50 ${
          className ?? ""
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 left-2"
        >
          <CloseIcon />
        </button>

        {children}
      </div>
    </div>,
    document.body
  );
}
