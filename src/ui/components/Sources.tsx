import { useState } from "react";
import { Box, Text, useInput } from "ink";
import { useStore } from "../store";
import { Panel } from "./Panel";
import { wrapStep } from "../move";
import { COLOR, GUTTER, ICON, SOURCE_STYLE } from "../theme";
import { truncate } from "../../util/format";
import type { SourceId } from "../../sources/types";

interface AuthSource {
  style: SourceId;
  label: string;
  homepage: string;
}

const AUTH_SOURCES: AuthSource[] = [
  { style: "rt-movies", label: "RuTracker", homepage: "rutracker.org" },
];

export function Sources() {
  const { region, contentWidth, listRows, rutrackerUser, openLogin, logout } = useStore();
  const focused = region === "content";
  const [cursor, setCursor] = useState(0);
  const total = AUTH_SOURCES.length;
  const clamped = Math.min(cursor, Math.max(0, total - 1));

  const authedUser = (i: number): string | undefined => (i === 0 ? rutrackerUser : undefined);

  useInput(
    (input, key) => {
      if (key.upArrow) setCursor(wrapStep(clamped, -1, total));
      else if (key.downArrow) setCursor(wrapStep(clamped, 1, total));
      else if (key.return || input === "l") openLogin();
      else if (input === "x" && authedUser(clamped)) logout();
    },
    { isActive: focused && total > 0 },
  );

  const panelH = Math.max(5, listRows - 1);

  return (
    <Panel title="sources" width={contentWidth} focused={focused} height={panelH}>
      <Box>
        <Text dimColor>Sign in to sources that need an account to search.</Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {AUTH_SOURCES.map((s, i) => {
          const here = i === clamped && focused;
          const ss = SOURCE_STYLE[s.style];
          const user = authedUser(i);
          return (
            <Box key={s.label}>
              <Box width={GUTTER} flexShrink={0}>
                <Text color={COLOR.accent} bold>{here ? ICON.pointer : ""}</Text>
              </Box>
              <Box width={5} flexShrink={0}>
                <Text color={ss.color} bold={here}>{ss.tag}</Text>
              </Box>
              <Box flexGrow={1} minWidth={0} marginLeft={1} flexDirection="column">
                <Text bold={here} color={here ? COLOR.accent : undefined} dimColor={!here}>
                  {s.label}
                  <Text dimColor>{`  ${ICON.dot} ${s.homepage}`}</Text>
                </Text>
                {user ? (
                  <Text>
                    <Text color={COLOR.good}>{`${ICON.done} `}</Text>
                    <Text dimColor>{`Signed in as ${truncate(user, 24)}`}</Text>
                  </Text>
                ) : (
                  <Text dimColor>{`${ICON.dot} Not signed in`}</Text>
                )}
              </Box>
              <Box flexShrink={0} marginLeft={1}>
                {user ? (
                  <Text>
                    <Text color={COLOR.alt}>↵</Text>
                    <Text dimColor> switch</Text>
                    <Text dimColor>{`  ${ICON.dot}  `}</Text>
                    <Text color={COLOR.alt}>x</Text>
                    <Text dimColor> sign out</Text>
                  </Text>
                ) : (
                  <Text>
                    <Text color={COLOR.alt}>↵</Text>
                    <Text dimColor> sign in</Text>
                  </Text>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Panel>
  );
}
