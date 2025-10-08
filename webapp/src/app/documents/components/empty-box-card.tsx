import EmptyBox from "@/shared/icons/empty-box";
import { Card } from "@/shared/ui/card";

export default function EmptyBoxCard() {
  return (
    <Card className="flex w-full h-full justify-center items-center gap-[10px] flex flex-col">
      <EmptyBox />
      <p className="text-midnight-gray-900 font-[600] text-[20px]">Empty Box</p>
      <p className="text-center text-sm text-midnight-gray-600">
        You have not created or recieved any documents. To <br /> create a
        document , please upload a file.
      </p>
    </Card>
  );
}
