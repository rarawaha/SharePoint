import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import SearchResults from "./components/RecherchePersonnalisee";

export interface ISearchResultsWebPartProps {
  pageSize: number;
}

export default class SearchResultsWebPart extends BaseClientSideWebPart<ISearchResultsWebPartProps> {
  public render(): void {
    const element: React.ReactElement = React.createElement(SearchResults, {
      context: this.context,
      pageSize: this.properties.pageSize,
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "",
          },
          groups: [
            {
              groupName: "Configuration",
              groupFields: [
                PropertyPaneTextField("pageSize", {
                  label: "Nombre d'éléments par page",
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
