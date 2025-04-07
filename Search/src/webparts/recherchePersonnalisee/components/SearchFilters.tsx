import * as React from "react";
import {
  //Checkbox,
  //Label,
  FluentProvider,
  teamsLightTheme,
} from "@fluentui/react-components";
import { DatePicker, IDatePickerStrings } from "@fluentui/react/lib/DatePicker";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import styles from "./RecherchePersonnalisee.module.scss";
import { Stack } from "@fluentui/react/lib/Stack";

interface SearchFiltersProps {
  availableTypes: string[];
  selectedTypes: string[];
  availableAuthors: string[];
  selectedAuthors: string[];
  //selectedDates: Date[];
  onFilterChange: (selectedTypes: string[], selectedAuthors: string[]) => void;
  // eslint-disable-next-line @rushstack/no-new-null
  onFilterDateChange: (dateStart: Date | null, dateEnd: Date | null) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  availableTypes,
  selectedTypes,
  availableAuthors,
  selectedAuthors,
  onFilterChange,
  onFilterDateChange,
}) => {
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  //const [filtersDate, setFiltersDate] = React.useState<string[]>([]);
  const [isTypesOpen, setIsTypesOpen] = React.useState<boolean>(false);
  const [isAuthorsOpen, setIsAuthorsOpen] = React.useState<boolean>(false);

  // 📌 Fonction pour basculer l'affichage d'un filtre
  const toggleFilter = (filter: "type" | "author"): void => {
    if (filter === "type") {
      setIsTypesOpen(!isTypesOpen);
    } else {
      setIsAuthorsOpen(!isAuthorsOpen);
    }
  };

  const handleCheckboxChange = (
    type: string,
    category: "type" | "author"
  ): void => {
    let updatedFilters;
    if (category === "type") {
      updatedFilters = selectedTypes.includes(type)
        ? selectedTypes.filter((ext) => ext !== type)
        : [...selectedTypes, type];
      onFilterChange(updatedFilters, selectedAuthors);
    } else {
      updatedFilters = selectedAuthors.includes(type)
        ? selectedAuthors.filter((auth) => auth !== type)
        : [...selectedAuthors, type];
      onFilterChange(selectedTypes, updatedFilters);
    }
  };

  // Localisation française pour les dates
  const datePickerStrings: IDatePickerStrings = {
    months: [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ],
    shortMonths: [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ],
    shortDays: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    days: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    goToToday: "Aujourd'hui",
    prevMonthAriaLabel: "Mois précédent",
    nextMonthAriaLabel: "Mois suivant",
  };

  // Met à jour les filtres
  const updateDateFilters = (): void => {
    //const newFilters: string[] = [];

    if (startDate && endDate) {
      const formattedStart = startDate.toISOString().split("T")[0];
      const formattedEnd = endDate.toISOString().split("T")[0];
      const dateInf = new Date(formattedStart);
      const dateSup = new Date(formattedEnd);
      onFilterDateChange(dateInf, dateSup);
    }

    //setFiltersDate(newFilters);
    //onFilterDateChange([dateInf, dateSup]);
  };

  return (
    <FluentProvider theme={teamsLightTheme} className={styles.filterContent}>
      <div
        className={styles.filter}
        style={{ padding: "15px", borderRight: "1px solid #ccc" }}
      >
        <div
          className={styles.filterHeader}
          onClick={() => toggleFilter("type")}
        >
          <h4>Filtrer par type de fichier</h4>
          <span>{isTypesOpen ? "▲" : "▼"}</span>
        </div>
        {isTypesOpen && (
          <div className={styles.filterContent}>
            {availableTypes.length > 0 ? (
              availableTypes.map((extension) => (
                <div key={extension} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    id={extension}
                    checked={selectedTypes.includes(extension)}
                    onChange={() => handleCheckboxChange(extension, "type")}
                  />
                  <label htmlFor={extension}>{extension.toUpperCase()}</label>
                </div>
              ))
            ) : (
              <p>Aucun filtre tpe disponible</p>
            )}
          </div>
        )}
        <div
          className={styles.filterHeader}
          onClick={() => toggleFilter("author")}
        >
          <h4>Filtrer par auteur</h4>
          <span>{isAuthorsOpen ? "▲" : "▼"}</span>
        </div>
        {isAuthorsOpen && (
          <div className={styles.filterContent}>
            {availableAuthors.length > 0 ? (
              availableAuthors.map((author) => (
                <div key={author} className={styles.filterOption}>
                  <input
                    type="checkbox"
                    id={author}
                    checked={selectedAuthors.includes(author)}
                    onChange={() => handleCheckboxChange(author, "author")}
                  />
                  <label htmlFor={author}>{author}</label>
                </div>
              ))
            ) : (
              <p>Aucun filtre auteur disponible</p>
            )}
          </div>
        )}

        <div className="search-filters">
          <h4>Filtrer par date de modification</h4>
          <Stack tokens={{ childrenGap: 10 }}>
            <DatePicker
              label="Début plage"
              allowTextInput={true}
              value={startDate ?? undefined}
              onSelectDate={(date) => {
                setStartDate(date ?? null);
                updateDateFilters();
              }}
              strings={datePickerStrings}
            />

            <DatePicker
              label="Fin plage"
              allowTextInput={true}
              value={endDate ?? undefined}
              onSelectDate={(date) => {
                setEndDate(date ?? null);
                updateDateFilters();
              }}
              strings={datePickerStrings}
            />
            <PrimaryButton text="Appliquer" onClick={updateDateFilters} />
            <PrimaryButton
              text="Effacer les filtres"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                onFilterDateChange(null, null); // Remettre à zéro côté parent
              }}
              styles={{ root: { backgroundColor: "#d13438", color: "white" } }}
            />
          </Stack>
        </div>
      </div>
    </FluentProvider>
  );
};

export default SearchFilters;
