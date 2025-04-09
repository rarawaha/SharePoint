import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp/presets/all";
import "@pnp/sp/search";
import "@pnp/sp/files";
//import SearchResults from "../components/RecherchePersonnalisee";
import {
  ISearchQuery,
  ISearchResult,
  SortDirection,
  /* SearchQueryBuilder,
  SearchQueryInit, */
} from "@pnp/sp/search";
//import { ISearchBox } from "@fluentui/react";

export interface SearchResult {
  UniqueId: string;
  ListItemId?: string;
  LastModifiedTime: Date;
  Title?: string;
  HitHighlightedSummary?: string;
  Path: string;
  Created?: Date;
  /* FileRef: string; */
  PictureThumbnailURL: string;
  ServerRedirectedEmbedURL: string;
  SPWebUrl: string;
  FileType: string;
  FileExtension: string;
  ParentLink?: string;
  Author: string;
  OpenInBrowserURL: string; // Lien direct pour ouvrir dans le navigateur
}

export class SearchService {
  private currentContext;
  private sp;
  private siteUrl: string;

  constructor(context: WebPartContext) {
    this.currentContext = context;
    this.sp = spfi().using(SPFx(context));
    this.siteUrl = context.pageContext.web.absoluteUrl;
  }

  private getDocUrl = (
    path: string,
    fileType: string,
    uniqueId: string
  ): string => {
    if (
      fileType === "jpg" ||
      fileType === "png" ||
      fileType === "jpeg" /* ||
      fileType === "mp4" */
    ) {
      return `${
        this.currentContext.pageContext.web.absoluteUrl
      }/_layouts/15/viewer.aspx?sourcedoc=${uniqueId}&file=${path
        .split("/")
        .pop()}&action=default&mobileredirect=true`;
    } else if (fileType === "mp4" || fileType === "avi" || fileType === "avi") {
      return path;
    } else if (
      fileType === "docx" ||
      fileType === "xlsx" ||
      fileType === "pptx" ||
      fileType === "csv"
    ) {
      return `${this.currentContext.pageContext.web.absoluteUrl}/_layouts/Doc.aspx?sourcedoc=${path}&file=${path}&action=default&mobileredirect=true`;
    } else {
      return path || "";
    }
  };
  private getPath = (item: ISearchResult): string => {
    if (
      item.FileType === "jpg" ||
      item.FileType === "png" ||
      item.FileType === "bmp" ||
      item.FileType === "gif" ||
      item.FileType === "jpeg" ||
      item.FileType === "mp4" ||
      item.FileType === "avi" ||
      item.FileType === "mov"
    ) {
      return (
        item.ParentLink?.split("/Forms")[0] +
        "/" +
        item.Title +
        "." +
        item.FileType
      );
    } else if (item.Path === undefined) {
      return "";
    } else {
      return item.Path;
    }
  };
  // 📌 Exécute une requête de recherche SharePoint
  public async search(query: string): Promise<SearchResult[]> {
    try {
      // Interdire l'utilisation de l'astérisque dans la requête
      if (query.endsWith("*")) {
        console.error("L'utilisation de '*' dans la recherche est interdite.");
        return []; // Retourne un tableau vide si '*' est détecté
      }

      const allResults: ISearchResult[] = [];
      let currentStartRow = 0;
      const maxResultsPerBatch = 500; // Nombre de résultats par lot
      const maxTotalResults = 50000; // Limite totale pour éviter des requêtes infinies

      while (currentStartRow < maxTotalResults) {
        const queryInit: ISearchQuery = {
          Querytext: query,
          SourceId: "8413cd39-2156-4e00-b54d-11efd9abdb89",
          QueryTemplate: `(FileType:docx OR FileType:pdf OR FileType:xlsx OR FileType:pptx OR FileType:txt OR FileType:jpg OR FileType:png OR FileType:gif OR FileType:aspx OR FileType:html OR FileType:mp4 OR FileType:mov OR FileType:wmv OR FileType:avi)} AND Path:${this.siteUrl}/*`, // AND Path:${this.siteUrl AND (FileType:docx OR FileType:pdf OR FileType:xlsx OR FileType:pptx OR FileType:txt OR FileType:jpg OR FileType:png OR FileType:gif OR FileType:aspx OR FileType:html OR FileType:mp4 OR FileType:mov OR FileType:wmv OR FileType:avi)`, // Limit search to the current site and include documents, images, pages, and videos
          RowLimit: maxResultsPerBatch,
          StartRow: currentStartRow, // Pagination : commence à la ligne actuelle
          EnableInterleaving: true,
          EnableNicknames: true,
          EnableQueryRules: true,
          TrimDuplicates: true,
          EnableSorting: true,
          SortList: [
            {
              Property: "Rank", // Trier par pertinence
              Direction: SortDirection.Descending,
            },
            {
              Property: "LastModifiedTime", // Trier par date décroissante
              Direction: SortDirection.Descending,
            },
          ],
          SelectProperties: [
            "UniqueId",
            "Title",
            "HitHighlightedSummary",
            "LastModifiedTime",
            "ParentLink",
            "FileRef", // Ajout de FileRef
            "Path",
            "ServerRedirectedEmbedURL",
            "SPWebUrl",
            "FileExtension",
            "FileType",
            "FileName", // Ajout de FileName
            "PictureThumbnailURL",
            "Author",
          ],
          RefinementFilters: [`or(FileType:equals(${query}),Title:${query}*)`],
          /* Refiners: "FileType,FileName", */
        };
        const searchResults = await this.sp.search(queryInit);

        allResults.push(
          ...searchResults.PrimarySearchResults.filter(
            (r) => r.FileType !== null
          )
        );

        // Si moins de résultats que le lot demandé, on a atteint la fin
        if (searchResults.PrimarySearchResults.length < maxResultsPerBatch) {
          break;
        }
        // Passer au lot suivant
        currentStartRow += maxResultsPerBatch;
      }

      return allResults.map((item: ISearchResult) => ({
        UniqueId: item.UniqueId === undefined ? "" : item.UniqueId,
        ListItemId: item.UniqueId,
        Title: item.Title,
        HitHighlightedSummary: item.HitHighlightedSummary,
        Path: this.getPath(item),
        ParentLink: item.ParentLink,
        LastModifiedTime:
          item.LastModifiedTime === undefined
            ? new Date()
            : item.LastModifiedTime,
        FileExtension:
          item.FileExtension === undefined ? "" : item.FileExtension,
        SPWebUrl: item.SPWebUrl === undefined ? "" : item.SPWebUrl,
        PictureThumbnailURL:
          item.FileType === "mp4" ||
          item.FileType === "avi" ||
          item.FileType === "mov"
            ? `${this.siteUrl}/_layouts/15/getpreview.ashx?path=${this.getPath(
                item
              )}`
            : item.PictureThumbnailURL && item.PictureThumbnailURL !== ""
            ? item.PictureThumbnailURL
            : `${this.siteUrl}/_layouts/15/getpreview.ashx?path=${this.getPath(
                item
              )}`,
        ServerRedirectedEmbedURL:
          item.ServerRedirectedEmbedURL === undefined
            ? ""
            : item.ServerRedirectedEmbedURL,
        /* FileName: item.FileName ?? "", // Récupération de FileName
            : item.ServerRedirectedEmbedURL, */
        Author: item.Author === undefined ? "" : item.Author,
        FileType: item.FileType === undefined ? "" : item.FileType,
        /*  FileName: item["FileName"] ?? "", // Récupération de FileName
        FileRef: item.FileRef ?? "",  */ // Récupération de FileRef
        OpenInBrowserURL: this.getDocUrl(
          item.Path ?? "",
          item.FileType ?? "",
          item.UniqueId ?? ""
        ),
      }));
    } catch (error) {
      console.error("Erreur de recherche :", error);
      return [];
    }
  }
}
