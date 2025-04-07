/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  Input,
  Button,
  FluentProvider,
  teamsLightTheme,
  //Display,
} from "@fluentui/react-components";
import {
  ChevronRight12Regular,
  ChevronLeft12Regular,
  ChevronDoubleRightRegular,
  ChevronDoubleLeftRegular,
} from "@fluentui/react-icons";
import { SearchResult, SearchService } from "../Services/SearchService";
import SearchFilters from "./SearchFilters";
import styles from "./RecherchePersonnalisee.module.scss";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ISearchResult } from "@pnp/sp/search";
//import { set } from "@microsoft/sp-lodash-subset";

//import { FileTypeIcon, IconType, ImageSize } from "@pnp/spfx-controls-react";

export interface RecherchePersonnaliseeProps {
  context: WebPartContext;
  pageSize: number;
}

const SearchResults: React.FC<RecherchePersonnaliseeProps> = (
  props: RecherchePersonnaliseeProps
) => {
  const searchService = new SearchService(props.context);
  const [query, setQuery] = React.useState<string>("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = React.useState<string[]>([]); // 🔥 Stocke les extensions uniques
  const [selectedAuthors, setSelectedAuthors] = React.useState<string[]>([]);
  const [availableAuthors, setAvailableAuthors] = React.useState<string[]>([]); // 🔥 Stocke les auteurs uniques
  //le filtre par les 2 dates date de début et de fin

  const [dateFilterStart, setDateFilterStart] = React.useState<Date | null>();
  const [dateFilterEnd, setDateFilterEnd] = React.useState<Date | null>();

  //Icon du document résultat de recherche
  /* let fileExtension: string;
  const iconUrl: string; */

  // 📌 Fonction pour exécuter la recherche
  const handleSearch = async (): Promise<void> => {
    if (!query.trim()) return;
    setLoading(true);
    setCurrentPage(1); // Réinitialise à la première page
    const searchResults = await searchService.search(query);
    setResults(searchResults);
    setLoading(false);

    // 🔥 Extraire dynamiquement les extensions disponibles
    const filterFileExtension = (element: ISearchResult): boolean => {
      return element.FileType !== undefined && element.FileType !== null;
    };
    const uniqueExtensions = Array.from(
      new Set(
        searchResults
          .filter(filterFileExtension)
          .map((result) => result?.FileType?.toLowerCase())
      )
    );
    setAvailableTypes(uniqueExtensions);

    // 🔥 Extraire dynamiquement les auteurs uniques
    const uniqueAuthors = Array.from(
      new Set(searchResults.map((result) => result.Author))
    );
    setAvailableAuthors(uniqueAuthors);
  };

  // 📌 Gestion des filtres (Réinitialisation de la pagination)
  const handleFilterChange = (types: string[], authors: string[]): void => {
    setSelectedTypes(types);
    setSelectedAuthors(authors);
    setCurrentPage(1);
  };

  const handleFilterDateChange = (
    /*  results: SearchResult[], */
    startDate: Date | null,
    endDate: Date | null
  ): void => {
    //let resultResponse: SearchResult[] = [];
    setDateFilterStart(startDate);
    setDateFilterEnd(endDate);
    /*
    const filtered = results.filter((result) => {
      if (!result.LastModifiedTime) return false;
      const modified = new Date(result.LastModifiedTime);

      if (startDate && modified < startDate) return false;
      if (endDate && modified > endDate) return false;

      return true;
    }); */
    if (!startDate && !endDate) {
      setResults(results);
    }
    /* if (startDate !== undefined && endDate !== undefined) {
      resultResponse = results.filter((result2) => {
        return (
          new Date(result2.LastModifiedTime.toString().split("T")[0]) >=
            startDate &&
          new Date(result2.LastModifiedTime.toString().split("T")[0]) <= endDate
        );
      });
    } else {
      resultResponse = results;
    }
    setResults(resultResponse); */
  };

  // 📌 Détection de la touche "Entrée" pour lancer la recherche
  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ): Promise<void> => {
    if (event.key === "Enter") {
      await handleSearch();
    }
  };

  // 📌 Appliquer les filtres
  const filteredResults = React.useMemo(() => {
    return results.filter((result) => {
      const matchesType =
        selectedTypes.length > 0
          ? selectedTypes.includes(result.FileType?.toLowerCase())
          : true;
      const matchesAuthor =
        selectedAuthors.length > 0
          ? selectedAuthors.includes(result.Author)
          : true;
      const matchesDate = result.LastModifiedTime
        ? (!dateFilterStart ||
            new Date(result.LastModifiedTime) >= dateFilterStart) &&
          (!dateFilterEnd || new Date(result.LastModifiedTime) <= dateFilterEnd)
        : true;

      return matchesType && matchesAuthor && matchesDate;
    });
  }, [results, selectedTypes, selectedAuthors, dateFilterStart, dateFilterEnd]);

  // 📌 Mise à jour du total des pages quand `filteredResults` change
  React.useEffect(() => {
    setTotalPages(Math.ceil(filteredResults.length / props.pageSize));
  }, [filteredResults]);

  // 📌 Gestion de la pagination
  const paginatedResults = React.useMemo(() => {
    return filteredResults.slice(
      (currentPage - 1) * props.pageSize,
      currentPage * props.pageSize
    );
  }, [filteredResults, currentPage]);

  const getFileIconUrl = (siteUrl: string, fileType: string): string => {
    let iconUrl: string = "";
    if (fileType === "png" || fileType === "jpg" || fileType === "jpeg") {
      iconUrl =
        "https://res.cdn.office.net/midgard/versionless/fluentui-resources/1.0.50/assets/item-types/32/photo.svg";
    } else if (fileType === "zip" || fileType === "cab") {
      iconUrl =
        "https://res.cdn.office.net/midgard/versionless/fluentui-resources/1.0.50/assets/item-types/32/zip.svg";
    } else if (fileType === "aspx" || fileType === "html") {
      iconUrl =
        "https://res.cdn.office.net/midgard/versionless/fluentui-resources/1.0.50/assets/item-types/32/html.svg";
    } else if (fileType === "csv") {
      iconUrl =
        "https://res.cdn.office.net/midgard/versionless/fluentui-resources/1.0.50/assets/item-types/32/csv.svg";
    } else if (fileType === "txt") {
      iconUrl =
        "https://res.cdn.office.net/midgard/versionless/fluentui-resources/1.0.50/assets/item-types/32/txt.svg";
    } else if (fileType === "mp4") {
      iconUrl =
        "https://res.cdn.office.net/midgard/versionless/fluentui-resources/1.0.50/assets/item-types/32/video.svg";
    } else if (
      fileType === "json" ||
      fileType === "ps1" ||
      fileType === "js" ||
      fileType === "css" ||
      fileType === "xml"
    ) {
      iconUrl =
        "https://res.cdn.office.net/midgard/versionless/fluentui-resources/1.0.50/assets/item-types/32/code.svg";
    } else {
      iconUrl = siteUrl + `/_layouts/15/images/ic${fileType}.png`;
    }
    return iconUrl;
    /* return fileType === null || fileType === undefined
        ? "https://res.cdn.office.net/midgard/versionless/fluentui-resources/1.0.50/assets/item-types/32/photo.svg"
        : siteUrl + `/_layouts/15/images/ic${fileType}.png`; */
  };

  /* const getDocUrl = (
    path: string,
    fileType: string,
    fileRef: string,
    uniqueId: string
  ): string => {
    if (fileType === "pdf" || fileType === "txt" || fileType === "mp4") {
      return `${
        props.context.pageContext.web.absoluteUrl
      }/_layouts/15/viewer.aspx?sourcedoc=${uniqueId}&file=${path
        .split("/")
        .pop()}&action=default&mobileredirect=true`;
    }
    if (
      fileType === "jpg" ||
      fileType === "png" ||
      fileType === "gif" ||
      fileType === "bmp"
    ) {
      return fileRef; //`blob:${fileRef}/${uniqueId}`;
    }
    return `${props.context.pageContext.web.absoluteUrl}/_layouts/Doc.aspx?sourcedoc=${fileRef}&file=${fileRef}&action=default&mobileredirect=true`;
  }; */

  return (
    <FluentProvider theme={teamsLightTheme}>
      <div className={styles.layout}>
        {/* 📌 Zone des filtres */}
        <SearchFilters
          availableTypes={availableTypes} // 🔥 Passe les extensions récupérées
          selectedTypes={selectedTypes}
          availableAuthors={availableAuthors} // 🔥 Passe les auteurs récupérés
          selectedAuthors={selectedAuthors}
          onFilterChange={handleFilterChange}
          onFilterDateChange={handleFilterDateChange}
        />
        <div className={styles.content}>
          <h3>Nombre de résultats: {filteredResults.length}</h3>

          <div className={styles.commandsBarContainer}>
            {/* 📌 Barre de recherche */}
            <Input
              type="text"
              value={query}
              placeholder="Rechercher..."
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown} // 🔥 Détection de la touche "Entrée"
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <Button
              onClick={handleSearch}
              disabled={loading}
              className={styles.btnSearchAction}
            >
              {loading ? "Recherche..." : "Rechercher"}
            </Button>
          </div>
          {/* 📌 Affichage des résultats */}
          <ul className={styles.resultsGrid}>
            {paginatedResults.length > 0 ? (
              paginatedResults.map((result, index) => (
                <li key={index} className={styles.tile}>
                  <div
                    className={styles.fileIcon}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      columnGap: "10px",
                    }}
                  >
                    <img
                      src={getFileIconUrl(result.SPWebUrl, result.FileType)}
                      alt={result.FileType}
                      className={styles.fileIcon}
                    />
                    <a
                      href={result.Path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {(result.Title ?? "").length > 40
                        ? result.Title?.substring(0, 340) + "..."
                        : result.Title}
                    </a>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      columnGap: "10px",
                    }}
                  >
                    <div
                      style={{
                        lineBreak: "anywhere",
                        flexBasis: "70%",
                        flexGrow: "0",
                        flexShrink: "0",
                      }}
                    >
                      {result.HitHighlightedSummary}
                    </div>
                    <div
                      style={{
                        flexBasis: "100px",
                        flexGrow: "0",
                        flexShrink: "0",
                        textAlign: "center",
                        verticalAlign: "middle",
                        alignContent: "center",
                        backgroundColor: "#f9f8f7",
                      }}
                    >
                      {/* Affichage de la prévisualisation pour les types supportés */}
                      {result.PictureThumbnailURL &&
                        result.OpenInBrowserURL && (
                          <a
                            href={result.OpenInBrowserURL}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={result.PictureThumbnailURL}
                              alt="Preview"
                              className={styles.previewImage}
                            />
                          </a>
                        )}
                    </div>
                  </div>
                  <p>
                    <b>Emplacemnt:</b>{" "}
                    <a
                      href={result.ParentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ouvrir l&apos;emplacement
                    </a>
                  </p>
                  <p>
                    <b>Auteur:</b> {result.Author}
                  </p>
                  <p>
                    <b>Modifié le</b>{" "}
                    {new Date(
                      result.LastModifiedTime.toString()
                    ).toLocaleDateString("fr-FR")}
                  </p>
                </li>
              ))
            ) : (
              <p>Aucun résultat trouvé.</p>
            )}
          </ul>
          {/* 📌 Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              {/* Bouton "Première Page" */}
              <Button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                icon={<ChevronDoubleLeftRegular />}
              />

              <Button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                icon={<ChevronLeft12Regular />}
              />
              <span>
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                icon={<ChevronRight12Regular />}
              />
              {/* Bouton "Dernière Page" */}
              <Button
                className={styles.paginationButton}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                icon={<ChevronDoubleRightRegular />}
              />
            </div>
          )}
        </div>
      </div>
    </FluentProvider>
  );
};

export default SearchResults;
