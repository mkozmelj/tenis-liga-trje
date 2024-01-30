import axios from "axios";
import { toDate, parse } from "date-fns";
import { Player, Match, Sheet, PlayerName } from "./types";

export async function getData(
  liga: number,
  range: string
): Promise<string[][]> {
  return axios
    .get(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_GSHEETS_ID}/values/${liga}.liga!${range}?key=${process.env.REACT_APP_GSHEETS_KEY}`,
      {}
    )
    .then((response) => response.data.values);
}

export async function getLeagues() {
  return axios
    .get(
      `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_GSHEETS_ID}?key=${process.env.REACT_APP_GSHEETS_KEY}`,
      {}
    )
    .then((response) => {
      const sheets = response.data.sheets;
      return sheets.map(
        (sheet: Sheet) => +sheet.properties.title.split(".")[0]
      );
    });
}

export async function getTableData(league: number): Promise<Player[]> {
  return getData(league, "C4:I14").then((data: string[][]) => {
    const players = [] as Player[];
    data.map((player: string[], index: number) => {
      const nameArray = player[0].split(" ");
      players.push({
        id: index,
        firstname: nameArray[0],
        lastname: nameArray.slice(1, nameArray.length).join(" "),
        matches: +player[1],
        wins: +player[2],
        loses: +player[3],
        plus: +player[4],
        minus: +player[5],
        points: +player[6],
        league,
      });
    });

    return players;
  });
}

export async function getMatches(league: number): Promise<Match[]> {
  return getData(league, "A17:G61").then((data: string[][]) => {
    const matches = [] as Match[];
    data.map((match: string[], index: number) => {
      matches.push({
        id: index,
        first_player: {
          name: match[0],
          score: match[2] ? +match[2] : null,
        },
        second_player: {
          name: match[1],
          score: match[4] ? +match[4] : null,
        },
        date: match[5]
          ? toDate(parse(match[5], "dd/MM/yyyy H:m", new Date()))
          : undefined,
        played: match[2] !== "" && match[4] !== "",
        court: +match[6],
        league,
      });
    });

    return matches;
  });
}

export async function getAllMatches(): Promise<Match[]> {
  const response = await Promise.all([
    getMatches(1),
    getMatches(2),
    getMatches(3),
  ]);

  return [...response[0], ...response[1], ...response[2]];
}

export async function getPlayers(league: number): Promise<PlayerName[]> {
  return getData(league, "A4:A14").then((data: string[][]) => {
    return data.map((player: string[]) => ({
      name: player[0],
    }));
  });
}
