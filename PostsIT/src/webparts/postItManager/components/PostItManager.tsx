/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import {
  Delete12Regular,
  Edit12Regular,
  Save16Filled,
} from "@fluentui/react-icons";
import {
  FluentProvider,
  teamsLightTheme,
  Button,
  Input,
  Textarea,
} from "@fluentui/react-components";
import Draggable from "react-draggable";
import { IPostIt, PostItService } from "../Services/PostItService";
import { IPostItManagerProps } from "./IPostItManagerProps";
import styles from "./PostItManager.module.scss";
import { Toggle } from "@fluentui/react";
import {
  ChoiceGroup,
  IChoiceGroupOption,
} from "@fluentui/react/lib/ChoiceGroup";
//import { DefaultButton, PrimaryButton } from "@fluentui/react";

const colors: IChoiceGroupOption[] = [
  { text: "Jaune", key: "#ffeb3b", defaultChecked: true },
  { text: "Bleu", key: "#03a9f4" },
  { text: "Vert", key: "#4caf50" },
  { text: "Rouge", key: "#f44336" },
  { text: "Violet", key: "#9c27b0" },
];

const colorOptions: IChoiceGroupOption[] = [
  { key: "jaune", text: "", styles: { root: { color: "#ffeb3b" } } },
  { key: "bleu", text: "", styles: { root: { color: "#03a9f4" } } },
  { key: "vert", text: "", styles: { root: { color: "#4caf50" } } },
  { key: "rouge", text: "", styles: { root: { color: "#f44336" } } },
  { key: "violet", text: "", styles: { root: { color: "#9c27b0" } } },
];

// Dictionnaire des couleurs HEX
const colorMap: Record<string, string> = {
  jaune: "#ffeb3b",
  bleu: "#03a9f4",
  vert: "#4caf50",
  rouge: "#f44336",
  violet: "#9c27b0",
};

const PostItManager: React.FunctionComponent<IPostItManagerProps> = (
  props: IPostItManagerProps
) => {
  const postItService = new PostItService(props.context);
  const [postIts, setPostIts] = React.useState<IPostIt[]>([]);
  const [newPostIt, setNewPostIt] = React.useState<IPostIt>({
    Title: "",
    Content: "",
    Color: "#FFD700",
    Position: JSON.stringify({ x: 10, y: 10 }),
    AuthorEmail: "",
    isEditing: false,
  });

  const [userEmail, setUserEmail] = React.useState("");
  const [showForm, setShowForm] = React.useState(false); // État pour afficher/cacher le formulaire
  const [selectedColor, setSelectedColor] = React.useState(colors[0].key); // gère l'état de la couleur sélectionnée

  React.useEffect(() => {
    const getEmail = async (): Promise<void> => {
      try {
        await getUserEmail();
      } catch (error) {
        console.log(error);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getEmail();
    let getPostIts: any;
    //if (userEmail) {
    try {
      getPostIts = async (): Promise<void> => {
        await loadPostIts();
      };
    } catch (error) {
      console.log(error);
    }
    //}
    getPostIts();
  }, [userEmail]);

  // 📌 Obtenir l'utilisateur connecté
  const getUserEmail = async (): Promise<void> => {
    const email = await postItService.getUserEmail();
    setUserEmail(email);
  };

  // 📌 Charger les post-its de l'utilisateur
  const loadPostIts = async (): Promise<void> => {
    const items = await postItService.getUserPostIts(userEmail);
    setPostIts(items);
  };

  // 📌 Ajouter un post-it
  const addPostIt = async (): Promise<void> => {
    await postItService.addPostIt({ ...newPostIt, AuthorEmail: userEmail });
    setNewPostIt({
      Title: "",
      Content: "",
      Color: "#FFD700",
      Position: JSON.stringify({ x: 10, y: 10 }),
      AuthorEmail: "",
      isEditing: false,
    });
    await loadPostIts();
  };

  // 📌 Modifier un post-it (passer en mode édition)
  const startEditing = (id: number): void => {
    setPostIts(
      postIts.map((p) => (p.Id === id ? { ...p, isEditing: true } : p))
    );
  };

  // 📌 Modifier un post-it
  const savePostIt = async (postIt: IPostIt): Promise<void> => {
    if (!postIt.Id) return;

    try {
      await postItService.updatePostIt(postIt);
      setPostIts(
        postIts.map((p) =>
          p.Id === postIt.Id ? { ...postIt, isEditing: false } : p
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du post-it :", error);
    }
  };

  // 📌 Supprimer un post-it
  const deletePostIt = async (id: number): Promise<void> => {
    await postItService.deletePostIt(id);
    await loadPostIts();
  };

  // 📌 Mettre à jour la position après déplacement
  const updatePosition = async (
    id: number,
    x: number,
    y: number
  ): Promise<boolean> => {
    const postIt = postIts.filter((p) => p.Id === id);
    if (postIt) {
      postIt[0].Position = JSON.stringify({ x, y });
      await postItService.updatePostIt(postIt[0]);
      return true;
    } else {
      return false;
    }
  };

  return (
    <FluentProvider theme={teamsLightTheme}>
      <div>
        <h2>Vos post-its</h2>
        {/* 📌 Toggle pour afficher/cacher le formulaire */}
        <Toggle
          label="Ajouter un post-it"
          defaultChecked={false}
          onText="On"
          offText="Off"
          onChange={() => setShowForm(!showForm)}
          className={styles.toggle}
        />
        {showForm && (
          <div className={styles.formContainer}>
            <Input
              placeholder="Titre"
              className={styles.inputField}
              value={newPostIt.Title}
              onChange={(e) =>
                setNewPostIt({ ...newPostIt, Title: e.target.value })
              }
            />
            <Textarea
              placeholder="Contenu"
              className={styles.inputField}
              value={newPostIt.Content}
              onChange={(e) =>
                setNewPostIt({ ...newPostIt, Content: e.target.value })
              }
            />
            {/* 📌 Sélection des couleurs avec ChoiceGroup */}
            {/* <ChoiceGroup
              options={colors}
              className={styles.colorSelection}
              selectedKey={selectedColor}
              value={newPostIt.Color}
              onChange={(e, data: IChoiceGroupOption) => {
                setSelectedColor(data.key);
                setNewPostIt({ ...newPostIt, Color: data.key });
              }}
            /> */}
            <label>Sélectionnez la coleur</label>
            <ChoiceGroup
              className={styles.colorSelection}
              options={colorOptions.map((option) => ({
                ...option,
                text: "",
                onRenderField: (props, render) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {/* 🟢 Ajout du cercle coloré */}
                    <span
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: colorMap[option.key], // 🎨 Appliquer la couleur
                        display: "inline-block",
                        border:
                          selectedColor === option.key
                            ? "3px solid black"
                            : "2px solid #cbcbca",
                      }}
                    />
                    {render!(props)} {/* Rendu du bouton radio */}
                  </div>
                ),
              }))}
              selectedKey={selectedColor}
              onChange={(e, data: IChoiceGroupOption) => {
                setSelectedColor(data.key);
                setNewPostIt({ ...newPostIt, Color: colorMap[data.key] });
              }}
            />
            <Button className={styles.button} onClick={addPostIt}>
              Ajouter
            </Button>
          </div>
        )}

        {/* 📌 Affichage des post-its */}
        <div className={styles.postItContainer}>
          {postIts.map((postIt) => {
            const pos = JSON.parse(postIt.Position || "{}");

            return (
              <Draggable
                key={postIt.Id}
                defaultPosition={{ x: pos.x, y: pos.y }}
                onStop={(e, data) =>
                  void updatePosition(postIt.Id!, data.x, data.y)
                }
              >
                <div
                  className={`${styles.postIt}`}
                  style={{ backgroundColor: postIt.Color }}
                >
                  {postIt.isEditing ? (
                    <>
                      <Input
                        value={postIt.Title}
                        onChange={(e) =>
                          setPostIts(
                            postIts.map((p) =>
                              p.Id === postIt.Id
                                ? { ...p, Title: e.target.value }
                                : p
                            )
                          )
                        }
                      />
                      <Textarea
                        value={postIt.Content}
                        onChange={(e) =>
                          setPostIts(
                            postIts.map((p) =>
                              p.Id === postIt.Id
                                ? { ...p, Content: e.target.value }
                                : p
                            )
                          )
                        }
                      />
                      <Button
                        icon={<Save16Filled />}
                        onClick={() => savePostIt(postIt)}
                      />
                    </>
                  ) : (
                    <>
                      {postIt.Color === "#ffeb3b" ? (
                        <>
                          <h4 style={{ color: "#000" }}>{postIt.Title}</h4>
                          <p style={{ color: "#000" }}>{postIt.Content}</p>
                        </>
                      ) : (
                        <>
                          <h4>{postIt.Title}</h4>
                          <p>{postIt.Content}</p>
                        </>
                      )}
                      <div className={styles.editButtons2}>
                        <Button
                          icon={<Edit12Regular />}
                          className={styles.buttonEdit}
                          onClick={() => startEditing(postIt.Id!)}
                        />
                        <Button
                          icon={<Delete12Regular />}
                          onClick={() => deletePostIt(postIt.Id!)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </Draggable>
            );
          })}
        </div>
      </div>
    </FluentProvider>
  );
};

export default PostItManager;
