"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Paper,
  Tooltip,
  Box,
  Anchor,
  rem,
  Center
} from "@mantine/core";

const tooltipTexts: Record<string, string> = {
  "30": "Dark Gray (33%)",
  "31": "Red",
  "32": "Yellowish Green",
  "33": "Gold",
  "34": "Light Blue",
  "35": "Pink",
  "36": "Teal",
  "37": "White",
  "40": "Blueish Black",
  "41": "Rust Brown",
  "42": "Gray (40%)",
  "43": "Gray (45%)",
  "44": "Light Gray (55%)",
  "45": "Blurple",
  "46": "Light Gray (60%)",
  "47": "Cream White",
};

export default function Home() {
  const [copyStatus, setCopyStatus] = useState("");
  const [copyCount, setCopyCount] = useState(0);
  const [colors, setColors] = useState<Record<number, string>>({});

  useEffect(() => {
    const newColors: Record<number, string> = {};
    [...Array(18)].forEach((_, i) => {
      const code = i < 8 ? i + 30 : i + 32; // 30-37 for FG, 40-47 for BG
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue(`--ansi-${code}-color`)
        .trim();
      newColors[code] = color;
    });
    setColors(newColors);

    // Initialize textarea content
    const textarea = document.querySelector("#textarea") as HTMLDivElement;
    if (textarea) {
      textarea.innerHTML = `Welcome to <span class="ansi-33">Rebane</span>'s <span class="ansi-45"><span class="ansi-37">Discord</span></span> <span class="ansi-31">C</span><span class="ansi-32">o</span><span class="ansi-33">l</span><span class="ansi-34">o</span><span class="ansi-35">r</span><span class="ansi-36">e</span><span class="ansi-37">d</span> Text Generator!`;
    }
  }, []);

  const handleStyleClick = (ansiCode: string) => {
    if (ansiCode === "0") {
      const textarea = document.querySelector("#textarea") as HTMLDivElement;
      if (textarea) {
        // Clear all text
        textarea.innerHTML = "";
      }
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // Don't do anything if no text is selected
    
    const text = selection.toString();
    const span = document.createElement("span");
    span.innerText = text;
    span.classList.add(`ansi-${ansiCode}`);

    range.deleteContents();
    range.insertNode(span);

    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const nodesToANSI = (nodes: NodeListOf<ChildNode> | ChildNode[], states: { fg: number; bg: number; st: number }[]): string => {
    let text = "";
    const nodeArray = Array.from(nodes);
    for (const node of nodeArray) {
      if (node.nodeType === 3) {
        text += node.textContent;
        continue;
      }
      if (node.nodeName === "BR") {
        text += "\n";
        continue;
      }
      const element = node as Element;
      const ansiCode = +(element.className.split("-")[1]);
      const newState = { ...states[states.length - 1] };

      if (ansiCode < 30) newState.st = ansiCode;
      if (ansiCode >= 30 && ansiCode < 40) newState.fg = ansiCode;
      if (ansiCode >= 40) newState.bg = ansiCode;

      states.push(newState);
      text += `\x1b[${newState.st};${ansiCode >= 40 ? newState.bg : newState.fg}m`;
      text += nodesToANSI(node.childNodes, states);
      states.pop();
      text += `\x1b[0m`;
      if (states[states.length - 1].fg !== 2) text += `\x1b[${states[states.length - 1].st};${states[states.length - 1].fg}m`;
      if (states[states.length - 1].bg !== 2) text += `\x1b[${states[states.length - 1].st};${states[states.length - 1].bg}m`;
    }
    return text;
  };

  const handleCopy = async () => {
    const textarea = document.querySelector("#textarea");
    if (!textarea) return;

    const toCopy = "```ansi\n" + nodesToANSI(textarea.childNodes, [{ fg: 2, bg: 2, st: 2 }]) + "\n```";
    
    try {
      await navigator.clipboard.writeText(toCopy);
      
      const funnyCopyMessages = [
        "Copied!", "Double Copy!", "Triple Copy!", "Dominating!!", 
        "Rampage!!", "Mega Copy!!", "Unstoppable!!", "Wicked Sick!!", 
        "Monster Copy!!!", "GODLIKE!!!", "BEYOND GODLIKE!!!!"
      ];

      setCopyStatus(copyCount <= 10 ? funnyCopyMessages[copyCount] : Array(16).fill(0).reduce(p => p + String.fromCharCode(Math.floor(Math.random() * 65535)), ""));
      setCopyCount(prev => Math.min(11, prev + 1));

      setTimeout(() => {
        setCopyStatus("");
        setCopyCount(0);
      }, 2000);
    } catch (err) {
      if (copyCount <= 2) {
        alert("Copying failed for some reason, let's try showing an alert, maybe you can copy it instead.");
        alert(toCopy);
      }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const base = target.innerHTML.replace(/<(\/?(br|span|span class="ansi-[0-9]*"))>/g, "[$1]");
    if (base.includes("<") || base.includes(">")) {
      target.innerHTML = base
        .replace(/<.*?>/g, "")
        .replace(/[<>]/g, "")
        .replace(/\[(\/?(br|span|span class="ansi-[0-9]*"))\]/g, "<$1>");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      document.execCommand("insertLineBreak");
      e.preventDefault();
    }
  };

  return (
    <Box bg="#36393F" style={{ minHeight: "100vh" }}>
      <Container size="lg" py="xl">
        <Stack gap="xl" align="center">
          <Title order={1} ta="center" c="white" style={{ maxWidth: "42rem" }}>
            Rebane&apos;s Discord{" "}
            <Text span c="#5865F2" inherit>
              Colored
            </Text>{" "}
            Text Generator
          </Title>

          <Paper p="md" radius="md" bg="transparent" c="white" style={{ width: "100%", maxWidth: "42rem" }}>
            <Stack gap="sm">
              <Title order={3}>About</Title>
              <Text>
                This is a simple app that creates colored Discord messages using the ANSI color codes
                available on the latest Discord desktop versions.
              </Text>
              <Text>
                To use this, write your text, select parts of it and assign colors to them,
                then copy it using the button below, and send in a Discord message.
              </Text>
            </Stack>
          </Paper>

          <Paper p="md" radius="md" bg="transparent" c="white" style={{ width: "100%", maxWidth: "42rem" }}>
            <Stack gap="sm">
              <Title order={3}>Source Code</Title>
              <Text>
                This app runs entirely in your browser and the source code is freely available on{" "}
                <Anchor
                  href="https://gist.github.com/rebane2001/07f2d8e80df053c70a1576d27eabe97c"
                  target="_blank"
                >
                  GitHub
                </Anchor>
                . Shout out to kkrypt0nn for{" "}
                <Anchor
                  href="https://gist.github.com/kkrypt0nn/a02506f3712ff2d1c8ca7c9e0aed7c06"
                  target="_blank"
                >
                  this guide
                </Anchor>
                .
              </Text>
            </Stack>
          </Paper>

          <Title order={2} ta="center" c="white">
            Create your text
          </Title>

          <Stack gap="md" align="center" style={{ width: "100%", maxWidth: "42rem" }}>
            <Group justify="center">
              <Button 
                variant="default" 
                onClick={() => handleStyleClick("0")}
              >
                Reset All
              </Button>
              <Button
                variant="default"
                onClick={() => handleStyleClick("1")}
                fw={700}
              >
                Bold
              </Button>
              <Button
                variant="default"
                onClick={() => handleStyleClick("4")}
                td="underline"
              >
                Line
              </Button>
            </Group>

            <Group justify="center" align="center">
              <Text fw={700} w={30}>FG</Text>
              <Group gap="xs">
                {[30, 31, 32, 33, 34, 35, 36, 37].map((code) => (
                  <Tooltip key={code} label={tooltipTexts[code.toString()]}>
                    <Button
                      variant="filled"
                      onClick={() => handleStyleClick(code.toString())}
                      style={{
                        width: rem(32),
                        height: rem(32),
                        padding: 0,
                        backgroundColor: colors[code] || 'transparent',
                        border: "none"
                      }}
                    />
                  </Tooltip>
                ))}
              </Group>
            </Group>

            <Group justify="center" align="center">
              <Text fw={700} w={30}>BG</Text>
              <Group gap="xs">
                {[40, 41, 42, 43, 44, 45, 46, 47].map((code) => (
                  <Tooltip key={code} label={tooltipTexts[code.toString()]}>
                    <Button
                      variant="filled"
                      onClick={() => handleStyleClick(code.toString())}
                      style={{
                        width: rem(32),
                        height: rem(32),
                        padding: 0,
                        backgroundColor: colors[code] || 'transparent',
                        border: "none"
                      }}
                    />
                  </Tooltip>
                ))}
              </Group>
            </Group>

            <Paper
              id="textarea"
              contentEditable
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              p="md"
              bg="#2F3136"
              c="#B9BBBE"
              style={{
                width: "100%",
                height: "12rem",
                textAlign: "left",
                fontFamily: "monospace",
                fontSize: "0.875rem",
                whiteSpace: "pre-wrap",
                resize: "both",
                overflow: "auto"
              }}
            />

            <Button
              size="lg"
              variant={copyStatus ? "filled" : "filled"}
              onClick={handleCopy}
              color={copyCount > 8 ? "red" : copyStatus ? "green" : "blue"}
              style={{ minWidth: rem(200) }}
            >
              {copyStatus || "Copy text as Discord formatted"}
            </Button>
          </Stack>

          <Text c="dimmed" size="sm" ta="center">
            This is an unofficial tool, it is not made or endorsed by Discord.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}