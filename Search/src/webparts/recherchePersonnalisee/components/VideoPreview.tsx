import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import { IconButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { ContextualMenu } from "@fluentui/react/lib/ContextualMenu";

interface IVideoPreviewProps {
  embedUrl: string;
}

export const VideoPreview: React.FC<IVideoPreviewProps> = ({ embedUrl }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!embedUrl) return null;

  return (
    <>
      {/* Miniature cliquable */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%",
          borderRadius: 6,
          backgroundColor: "#f3f0ef",
          cursor: "pointer",
          overflow: "hidden",
        }}
        onClick={() => setIsOpen(true)}
      >
        {embedUrl && (
          <img
            src={embedUrl}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <IconButton
          iconProps={{ iconName: "Play" }}
          styles={{
            root: {
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#d3d1d0",
              color: "#fff",
              fontSize: 32,
              width: 60,
              height: 60,
              borderRadius: "50%",
            },
          }}
          title="Lire la vidéo"
        />
      </div>

      <Dialog
        hidden={!isOpen}
        onDismiss={() => setIsOpen(false)}
        /* closeButtonAriaLabel="Fermer" */
        modalProps={{
          isBlocking: true,
          isDarkOverlay: false,
          dragOptions: {
            moveMenuItemText: "Move",
            closeMenuItemText: "Close",
            menu: ContextualMenu,
            keepInBounds: true,
          },
          /* styles: { main: { maxWidth: 800 } }, */
        }}
        dialogContentProps={{
          type: DialogType.largeHeader,
          title: "Prévisualisation de la vidéo",
          closeButtonAriaLabel: "Fermer",
          responsiveMode: 1,
          showCloseButton: true,
        }}
        maxWidth={800}
        minWidth={100} /* styles={{ root: { overflow: "hidden" } }} */
        styles={{ main: { overflow: "hidden" } }}
      >
        <video
          controls
          autoPlay={false}
          width="100%"
          poster={embedUrl}
          src={embedUrl}
        />
        <DialogFooter>
          <PrimaryButton text="Fermer" onClick={() => setIsOpen(false)} />
        </DialogFooter>
      </Dialog>
    </>
  );
};
