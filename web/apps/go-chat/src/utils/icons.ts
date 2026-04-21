import { defineComponent, h } from 'vue'
import type { Component } from 'vue'

export function icon(path: string, viewBox = '0 0 24 24'): Component {
  const nodes = path
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((segment) => {
      const [tag = 'path', ...attrs] = segment.trim().split('|')
      return {
        tag,
        attrs: Object.fromEntries(attrs.map((entry) => entry.split('='))),
      }
    })

  return defineComponent({
    name: 'InlineIcon',
    inheritAttrs: false,
    setup(_, { attrs }) {
      return () =>
        h(
          'svg',
          {
            ...attrs,
            viewBox,
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '1.8',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'aria-hidden': 'true',
          },
          nodes.map((node) => h(node.tag, node.attrs)),
        )
    },
  })
}

export const BubbleIcon = icon(`
path|d=M7 18h6l4 3v-3h.5A3.5 3.5 0 0 0 21 14.5v-7A3.5 3.5 0 0 0 17.5 4h-11A3.5 3.5 0 0 0 3 7.5v7A3.5 3.5 0 0 0 6.5 18H7Z
circle|cx=9|cy=11|r=.8
circle|cx=12|cy=11|r=.8
circle|cx=15|cy=11|r=.8
`)
export const UserIcon = icon(`path|d=M20 21a8 8 0 0 0-16 0\ncircle|cx=12|cy=8|r=4`)
export const StarIcon = icon(`path|d=M12 3.5l2.8 5.67 6.26.91-4.53 4.42 1.07 6.25L12 17.77 6.4 20.75l1.07-6.25L2.94 10.08l6.26-.91L12 3.5Z`)
export const HashIcon = icon(`path|d=M5 9h14M4 15h14M10 3 8 21M16 3l-2 18`)
export const ShareIcon = icon(`path|d=M14 3h7v7\npath|d=M10 14 21 3\npath|d=M21 13v5a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h5`)
export const GridIcon = icon(`
rect|x=4|y=4|width=6|height=6|rx=1.5
rect|x=14|y=4|width=6|height=6|rx=1.5
rect|x=4|y=14|width=6|height=6|rx=1.5
rect|x=14|y=14|width=6|height=6|rx=1.5
`)
export const MailIcon = icon(`path|d=M4 6h16v12H4z\npath|d=M4 8 12 13l8-5`)
export const PhoneIcon = icon(`rect|x=7|y=2.5|width=10|height=19|rx=2\npath|d=M11 18h2`)
export const MenuIcon = icon(`path|d=M4 7h16M4 12h16M4 17h16`)
export const SearchIcon = icon(`circle|cx=11|cy=11|r=6\npath|d=M20 20l-4.2-4.2`)
export const PlusIcon = icon(`path|d=M12 5v14M5 12h14`)
export const CloudIcon = icon(`path|d=M8 18h8a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 6.2 8.6 4.2 4.2 0 0 0 8 18Z`)
export const ExitIcon = icon(`path|d=M15 16l5-4-5-4\npath|d=M20 12H9\npath|d=M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6`)
export const PhoneCallIcon = icon(`path|d=M15 5a5 5 0 0 1 4 4\npath|d=M15 1a9 9 0 0 1 8 8\npath|d=M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.17 12.8 19.8 19.8 0 0 1 2.1 4.17 2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72l.45 3.14a2 2 0 0 1-.57 1.74L7.2 10.36a16 16 0 0 0 6.44 6.44l1.76-1.77a2 2 0 0 1 1.74-.57l3.14.45A2 2 0 0 1 22 16.9Z`)
export const VideoIcon = icon(`path|d=M15 10.5 21 7v10l-6-3.5\nrect|x=3|y=6|width=12|height=12|rx=2`)
export const ScreenIcon = icon(`rect|x=3|y=4|width=18|height=12|rx=2\npath|d=M8 20h8\npath|d=M12 16v4`)
export const UserPlusIcon = icon(`path|d=M19 8v6M16 11h6\ncircle|cx=9|cy=8|r=4\npath|d=M3 20a6 6 0 0 1 12 0`)
export const MoreIcon = icon(`circle|cx=5|cy=12|r=1.2\ncircle|cx=12|cy=12|r=1.2\ncircle|cx=19|cy=12|r=1.2`)
export const ArrowIcon = icon(`path|d=M9 6l6 6-6 6`)
export const SmileIcon = icon(`circle|cx=12|cy=12|r=9\npath|d=M8.5 14.5a5 5 0 0 0 7 0\npath|d=M9 10h.01M15 10h.01`)
export const ScissorsIcon = icon(`circle|cx=6|cy=18|r=2.2\ncircle|cx=6|cy=6|r=2.2\npath|d=M20 4 8.1 15.9\npath|d=M8.1 8.1 20 20`)
export const FolderIcon = icon(`path|d=M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z`)
export const ImageIcon = icon(`rect|x=3|y=5|width=18|height=14|rx=2\ncircle|cx=9|cy=10|r=1.6\npath|d=M21 15l-4.5-4.5L7 20`)
export const ArchiveIcon = icon(`rect|x=3|y=5|width=18|height=14|rx=2\npath|d=M9 10h6`)
export const MicIcon = icon(`rect|x=9|y=3|width=6|height=11|rx=3\npath|d=M6 11a6 6 0 0 0 12 0\npath|d=M12 17v4\npath|d=M9 21h6`)
export const ClockIcon = icon(`circle|cx=12|cy=12|r=9\npath|d=M12 7v5l3 2`)
export const GearIcon = icon(`circle|cx=12|cy=12|r=3\npath|d=M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z`)
