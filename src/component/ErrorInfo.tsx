import { ExclamationCircleOutlined } from '@ant-design/icons';

export default function ErrorInfo({ errorMessage }: { errorMessage: string | null }) {
  return (
    <div id="err" className="w-full flex justify-center">
      {errorMessage ? (
        <div className="text-red-600 flex items-center">
          <ExclamationCircleOutlined className="mr-1 text-[14px]" />
          <p className="text-xs">{errorMessage}</p>
        </div>
      ) : null}
    </div>
  );
}
