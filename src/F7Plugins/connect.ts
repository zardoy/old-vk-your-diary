import FileUploadGaugePlugin from "./fileUploadGauge";
import OverswipeFixPlugin from "./overswipeFix";
import Framework7React from "framework7-react";
import Finder7 from "./Finder7";

import Framework7 from "framework7/framework7.esm.bundle";
import SuperToasts from "./MoreToasts";
import simplePopups from "./simplePopups";

Framework7.use(Framework7React);
Framework7.use(FileUploadGaugePlugin);
Framework7.use(OverswipeFixPlugin);
Framework7.use(Finder7);
Framework7.use(SuperToasts);
Framework7.use(simplePopups);