/* eslint-disable @typescript-eslint/no-explicit-any */
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users";

export interface IPostIt {
  Id?: number;
  Title?: string;
  Content?: string;
  Color: string;
  Position?: string;
  isEditing: boolean;
  AuthorEmail?: string;
}

export class PostItService {
  private sp: ReturnType<typeof spfi>;
  private listName = "PostIts";

  constructor(context: any) {
    this.sp = spfi().using(SPFx(context));
  }

  public getUserEmail = async (): Promise<string> => {
    try {
      return (await this.sp.web.currentUser()).Email;
    } catch (error) {
      console.error("Erreur lors du chargement des post-its :", error);
      return "";
    }
    return (await this.sp.web.currentUser()).Email;
  };
  // 📌 Récupérer tous les post-its de l'utilisateur connecté
  public async getUserPostIts(userEmail: string): Promise<IPostIt[]> {
    try {
      const items: IPostIt[] = await this.sp.web.lists
        .getByTitle(this.listName)
        .items.filter(`AuthorEmail eq '${userEmail}'`)
        .select("Id", "Title", "Content", "Color", "Position", "AuthorEmail")();

      return items.map((item: any) => ({
        Id: item.Id,
        Title: item.Title,
        Content: item.Content,
        Color: item.Color,
        Position: item.Position,
        AuthorEmail: item.AuthorEmail,
        isEditing: item.isEditing,
      }));
    } catch (error) {
      console.error("Erreur lors du chargement des post-its :", error);
      return [];
    }
  }

  // 📌 Ajouter un post-it
  public async addPostIt(postIt: IPostIt): Promise<void> {
    try {
      await this.sp.web.lists.getByTitle(this.listName).items.add(postIt);
    } catch (error) {
      console.error("Erreur lors de l'ajout du post-it :", error);
    }
  }

  // 📌 Modifier un post-it
  public async updatePostIt(postIt: IPostIt): Promise<void> {
    if (!postIt.Id) return;

    try {
      await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(postIt.Id)
        .update({
          Title: postIt.Title,
          Content: postIt.Content,
          Color: postIt.Color,
          Position: postIt.Position,
        });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du post-it :", error);
    }
  }

  // 📌 Supprimer un post-it
  public async deletePostIt(id: number): Promise<void> {
    try {
      await this.sp.web.lists
        .getByTitle(this.listName)
        .items.getById(id)
        .delete();
    } catch (error) {
      console.error("Erreur lors de la suppression du post-it :", error);
    }
  }
}
