import Link from "next/link";

const Example = () => {
    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold mb-4">Second page example</h1>
            <h2><Link className="text-md underline" href="/">Home</Link></h2>
        </div>
    );
};
 
export default Example;