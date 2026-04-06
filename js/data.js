/* ═══════════════════════════════════════════════════
   data.js
   Single source of truth for the OSINT tree data.
   Each node: { name, children? }
   Each leaf: { name, type?, url }
   type: "T" local tool | "D" dork | "R" registration | "M" manual URL
═══════════════════════════════════════════════════ */

const DATA = {
  name: "OSINT\nFramework",
  children: [
    { name: "Username", children: [
      { name: "Search", children: [
        { name: "Sherlock",       type: "T", url: "https://github.com/sherlock-project/sherlock" },
        { name: "WhatsMyName",               url: "https://whatsmyname.app" },
        { name: "Namechk",                   url: "https://namechk.com" },
        { name: "KnowEm",                    url: "https://knowem.com" },
        { name: "CheckUsernames",            url: "https://checkusernames.com" }
      ]},
      { name: "Reputation", children: [
        { name: "SocialCatfish",  type: "R", url: "https://socialcatfish.com" },
        { name: "BeenVerified",   type: "R", url: "https://www.beenverified.com" },
        { name: "Spokeo",         type: "R", url: "https://spokeo.com" }
      ]}
    ]},

    { name: "Email", children: [
      { name: "Verification", children: [
        { name: "Hunter.io",      type: "R", url: "https://hunter.io" },
        { name: "EmailRep",                  url: "https://emailrep.io" },
        { name: "MXToolbox",                 url: "https://mxtoolbox.com" }
      ]},
      { name: "Breach Data", children: [
        { name: "HaveIBeenPwned",            url: "https://haveibeenpwned.com" },
        { name: "DeHashed",       type: "R", url: "https://dehashed.com" },
        { name: "Snusbase",       type: "R", url: "https://snusbase.com" }
      ]}
    ]},

    { name: "Domain / IP", children: [
      { name: "Whois / DNS", children: [
        { name: "Who.is",                    url: "https://who.is" },
        { name: "DNSdumpster",               url: "https://dnsdumpster.com" },
        { name: "ViewDNS",                   url: "https://viewdns.info" },
        { name: "crt.sh",                    url: "https://crt.sh" }
      ]},
      { name: "Scanning", children: [
        { name: "Shodan",         type: "R", url: "https://shodan.io" },
        { name: "Censys",         type: "R", url: "https://censys.io" },
        { name: "Nmap",           type: "T", url: "https://nmap.org" }
      ]},
      { name: "IP Geo", children: [
        { name: "IPinfo",                    url: "https://ipinfo.io" },
        { name: "IP-API",                    url: "https://ip-api.com" }
      ]}
    ]},

    { name: "Social Media", children: [
      { name: "Twitter/X", children: [
        { name: "Adv. Search",    type: "M", url: "https://twitter.com/search-advanced" },
        { name: "Twint",          type: "T", url: "https://github.com/twintproject/twint" }
      ]},
      { name: "LinkedIn", children: [
        { name: "LinkedIn Search",           url: "https://linkedin.com/search/results/all/" },
        { name: "LinkedInt",      type: "T", url: "https://github.com/mdsecresearch/LinkedInt" }
      ]},
      { name: "Facebook", children: [
        { name: "Who Posted What",           url: "https://whopostedwhat.com" },
        { name: "Lookup-ID",                 url: "https://lookup-id.com" }
      ]},
      { name: "Instagram", children: [
        { name: "Osintgram",      type: "T", url: "https://github.com/Datalux/Osintgram" }
      ]},
      { name: "Reddit", children: [
        { name: "Pushshift",                 url: "https://pushshift.io" },
        { name: "RedditSearch",              url: "https://www.redditsearch.io" }
      ]}
    ]},

    { name: "Search", children: [
      { name: "Google Dorks", children: [
        { name: "Exploit-DB GHDB", type: "D", url: "https://www.exploit-db.com/google-hacking-database" },
        { name: "DorkSearch",      type: "D", url: "https://dorksearch.com" }
      ]},
      { name: "Dark Web", children: [
        { name: "Ahmia",                     url: "https://ahmia.fi" },
        { name: "DarkSearch",                url: "https://darksearch.io" }
      ]},
      { name: "Code", children: [
        { name: "GitHub Search",             url: "https://github.com/search" },
        { name: "Grep.app",                  url: "https://grep.app" },
        { name: "PublicWWW",                 url: "https://publicwww.com" }
      ]}
    ]},

    { name: "People", children: [
      { name: "General", children: [
        { name: "Pipl",           type: "R", url: "https://pipl.com" },
        { name: "TruePeopleSearch",          url: "https://www.truepeoplesearch.com" },
        { name: "FastPeopleSearch",          url: "https://www.fastpeoplesearch.com" }
      ]},
      { name: "Phone", children: [
        { name: "Truecaller",     type: "R", url: "https://truecaller.com" },
        { name: "NumLookup",                 url: "https://www.numlookup.com" },
        { name: "SpyDialer",                 url: "https://spydialer.com" }
      ]},
      { name: "Records", children: [
        { name: "FamilyTreeNow",             url: "https://www.familytreenow.com" },
        { name: "PACER",          type: "R", url: "https://pacer.uscourts.gov" }
      ]}
    ]},

    { name: "Images", children: [
      { name: "Reverse Img", children: [
        { name: "Google Images",             url: "https://images.google.com" },
        { name: "TinEye",                    url: "https://tineye.com" },
        { name: "Yandex Images",             url: "https://yandex.com/images" }
      ]},
      { name: "Metadata", children: [
        { name: "ExifTool",       type: "T", url: "https://exiftool.org" },
        { name: "FotoForensics",             url: "https://fotoforensics.com" },
        { name: "Pic2Map",                   url: "https://www.pic2map.com" }
      ]}
    ]},

    { name: "Geolocation", children: [
      { name: "Maps", children: [
        { name: "Google Earth",              url: "https://earth.google.com" },
        { name: "OpenStreetMap",             url: "https://openstreetmap.org" },
        { name: "Bing Maps",                 url: "https://www.bing.com/maps" }
      ]},
      { name: "Satellite", children: [
        { name: "Sentinel Hub",              url: "https://www.sentinel-hub.com" },
        { name: "Zoom Earth",                url: "https://zoom.earth" }
      ]},
      { name: "Street", children: [
        { name: "Mapillary",                 url: "https://www.mapillary.com" },
        { name: "GeoGuessr",                 url: "https://geoguessr.com" }
      ]}
    ]},

    { name: "Networks", children: [
      { name: "IoT Search", children: [
        { name: "Shodan",         type: "R", url: "https://shodan.io" },
        { name: "ZoomEye",                   url: "https://www.zoomeye.org" },
        { name: "FOFA",                      url: "https://fofa.info" }
      ]},
      { name: "Wireless", children: [
        { name: "WiGLE",          type: "R", url: "https://wigle.net" }
      ]},
      { name: "Scanning", children: [
        { name: "Masscan",        type: "T", url: "https://github.com/robertdavidgraham/masscan" },
        { name: "Nmap",           type: "T", url: "https://nmap.org" }
      ]}
    ]},

    { name: "Documents", children: [
      { name: "Metadata", children: [
        { name: "FOCA",           type: "T", url: "https://github.com/ElevenPaths/FOCA" },
        { name: "Metagoofil",     type: "T", url: "https://github.com/laramies/metagoofil" }
      ]},
      { name: "Pastes", children: [
        { name: "Pastebin",                  url: "https://pastebin.com" },
        { name: "PasteLert",                 url: "https://andrewmohawk.com/pasteLert" }
      ]},
      { name: "Archives", children: [
        { name: "Archive.org",               url: "https://archive.org/web" },
        { name: "CachedView",                url: "https://cachedview.nl" },
        { name: "TimeTravel",                url: "http://timetravel.mementoweb.org" }
      ]}
    ]},

    { name: "Dark Web", children: [
      { name: "Search", children: [
        { name: "Ahmia",                     url: "https://ahmia.fi" },
        { name: "DarkSearch",                url: "https://darksearch.io" },
        { name: "IntelX",                    url: "https://intelx.io" }
      ]},
      { name: "Monitor", children: [
        { name: "Dark.Fail",                 url: "https://dark.fail" },
        { name: "OnionSearch",    type: "T", url: "https://github.com/megadose/OnionSearch" }
      ]}
    ]}
  ]
};
