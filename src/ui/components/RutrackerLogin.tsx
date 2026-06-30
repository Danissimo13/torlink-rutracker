import { useState } from "react";
import { Box, Text, useInput } from "ink";
import { TextField } from "./TextField";
import { Panel } from "./Panel";
import { Spinner } from "./Spinner";
import { useStore } from "../store";
import { COLOR, ICON } from "../theme";
import type { Captcha } from "../../sources/rutracker/session";
import { writeClipboard } from "../../util/clipboard";
import { openUrl } from "../../util/open";

export type LoginStatus =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "error"; message: string };

type FieldKey = "user" | "pass" | "captcha" | "open" | "copy";

interface RutrackerLoginProps {
  width: number;
  currentUser?: string;
  status: LoginStatus;
  captcha?: Captcha;
  onSubmit: (username: string, password: string, captchaCode?: string) => void;
  onCancel: () => void;
}

function Field({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Box width={10} flexShrink={0}>
        <Text color={active ? COLOR.accent : undefined} dimColor={!active}>
          {label}
        </Text>
      </Box>
      <Text color={active ? COLOR.accent : COLOR.alt}>{`${ICON.pointer} `}</Text>
      <Box flexGrow={1} minWidth={0}>
        {children}
      </Box>
    </Box>
  );
}

function Button({ label, active }: { label: string; active: boolean }) {
  return (
    <Text
      color={active ? COLOR.accent : COLOR.alt}
      inverse={active}
      bold={active}
    >
      {` ${label} `}
    </Text>
  );
}

export function RutrackerLogin({
  width,
  currentUser,
  status,
  captcha,
  onSubmit,
  onCancel,
}: RutrackerLoginProps) {
  const { setNotice } = useStore();
  const [field, setField] = useState<FieldKey>("user");
  const [username, setUsername] = useState(currentUser ?? "");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const busy = status.kind === "busy";

  const submit = (): void => {
    if (!username.trim() || !password) return;
    if (captcha && !code.trim()) return;
    onSubmit(username.trim(), password, captcha ? code.trim() : undefined);
  };

  const copyLink = (): void => {
    if (!captcha) return;
    void (async () => {
      const ok = await writeClipboard(captcha.imageUrl);
      setNotice(ok ? `${ICON.done} Captcha link copied` : "Couldn't copy the captcha link.");
    })();
  };

  const openLink = (): void => {
    if (!captcha) return;
    void (async () => {
      const ok = await openUrl(captcha.imageUrl);
      if (!ok) setNotice("Couldn't open a browser — copy the link instead.");
    })();
  };

  const order: FieldKey[] = captcha ? ["user", "pass", "captcha", "open", "copy"] : ["user", "pass"];
  const onButton = field === "open" || field === "copy";

  useInput((_input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }
    if (busy) return;
    if (key.return && onButton) {
      if (field === "open") openLink();
      else copyLink();
      return;
    }
    if (key.upArrow) {
      const i = order.indexOf(field);
      setField(order[Math.max(0, i - 1)]!);
    } else if (key.downArrow) {
      const i = order.indexOf(field);
      setField(order[Math.min(order.length - 1, i + 1)]!);
    } else if (onButton && key.leftArrow) {
      setField("open");
    } else if (onButton && key.rightArrow) {
      setField("copy");
    }
  });

  return (
    <Box flexDirection="column" width={width}>
      <Panel title="rutracker login" width={width} focused height={captcha ? 10 : 4}>
        <Field label="Username" active={field === "user" && !busy}>
          <TextField
            isDisabled={busy || field !== "user"}
            defaultValue={username}
            placeholder="username"
            onChange={setUsername}
            onSubmit={() => setField("pass")}
            onExitDown={() => setField("pass")}
          />
        </Field>
        <Field label="Password" active={field === "pass" && !busy}>
          <TextField
            isDisabled={busy || field !== "pass"}
            mask
            placeholder="password"
            onChange={setPassword}
            onSubmit={() => (captcha ? setField("captcha") : submit())}
            onExitDown={() => captcha && setField("captcha")}
          />
        </Field>
        {captcha ? (
          <>
            <Box marginTop={1}>
              <Text color={COLOR.warn}>{`${ICON.warn} Captcha required. Open the link, then type the code.`}</Text>
            </Box>
            <Field label="Captcha" active={field === "captcha" && !busy}>
              <TextField
                isDisabled={busy || field !== "captcha"}
                placeholder="code from image"
                onChange={setCode}
                onSubmit={submit}
              />
            </Field>
            <Box marginTop={1}>
              <Box width={10} flexShrink={0} />
              <Button label="Open Link" active={field === "open" && !busy} />
              <Text> </Text>
              <Button label="Copy Link" active={field === "copy" && !busy} />
            </Box>
          </>
        ) : null}
        <Box marginTop={1}>
          {status.kind === "busy" ? (
            <Spinner label="Signing in…" />
          ) : status.kind === "error" ? (
            <Text color={COLOR.bad}>{`${ICON.error} ${status.message}`}</Text>
          ) : currentUser ? (
            <Text dimColor>{`Signed in as ${currentUser}. Re-enter to switch accounts.`}</Text>
          ) : (
            <Text dimColor>Credentials are sent only to rutracker.org.</Text>
          )}
        </Box>
      </Panel>
      <Box marginTop={1}>
        <Text color={COLOR.alt}>↵</Text>
        <Text dimColor> next / sign in</Text>
        <Text dimColor>{`     ${ICON.dot}     `}</Text>
        <Text color={COLOR.alt}>↑↓</Text>
        <Text dimColor> field</Text>
        <Text dimColor>{`     ${ICON.dot}     `}</Text>
        <Text color={COLOR.alt}>esc</Text>
        <Text dimColor> cancel</Text>
      </Box>
    </Box>
  );
}
