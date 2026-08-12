import { Tabs, TabsList, TabsTrigger, TabsContent } from "@zstack/design";
import { HelperDoc, HeaderPage } from "@zstack/unifie";
import React from "react";
import { useIntl } from "react-intl";

import RecordList from "./record-list/index";
import ScriptList from "./script-list/index";

const ScriptLibrary: React.FC = () => {
  const intl = useIntl();
  return (
    <div className="bg-neutral-0 h-full w-full min-w-0 overflow-y-auto">
      <HeaderPage
        title={intl.formatMessage({
          id: "scriptLibrary",
          defaultMessage: "Script Library",
        })}
        description={
          <div className="flex items-center">
            {intl.formatMessage({
              id: "scriptLibrary.header.title",
              defaultMessage:
                "Script library stores and manages script files centrally. By executing scripts in VM instances, you can complete complex O&M operations and automated jobs.",
            })}
            <HelperDoc path="ZStack_UI_Doc_0117_1_1.html" />
          </div>
        }
      />
      <Tabs defaultValue="script">
        <TabsList className="pl-[24px]" variant="card">
          <TabsTrigger value="script">
            {intl.formatMessage({
              id: "script",
              defaultMessage: "Script",
            })}
          </TabsTrigger>
          <TabsTrigger value="execute.record">
            {intl.formatMessage({
              id: "execute.record",
              defaultMessage: "Execution Record",
            })}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="script">
          <div className="px-[24px] py-[20px]">
            <ScriptList view="main" />
          </div>
        </TabsContent>
        <TabsContent value="execute.record">
          <div className="px-[24px] py-[20px]">
            <RecordList view="main" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScriptLibrary;
