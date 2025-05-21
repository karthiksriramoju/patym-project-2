import prisma from "@repo/db/client";
import { AddMoney } from "../../components/AddMoneyCard";
import { BalanceCard2 } from "../../components/BalanceCard2";
import { OnRampTransactions } from "../../components/OnRampTransaction";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

async function getBalance() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return { amount: 0, locked: 0 };
    }
    try {
        const balance = await prisma.balance.findFirst({
            where: {
                userId: Number(session.user.id)
            }
        });
        return {
            amount: balance?.amount || 0,
            locked: balance?.locked || 0
        };
    } catch (error) {
        console.error('Error fetching balance:', error);
        return { amount: 0, locked: 0 };
    }
}

async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return [];
    }
    try {
        const txns = await prisma.onRampTransaction.findMany({
            where: {
                userId: Number(session.user.id)
            },
            orderBy: { startTime: 'desc' }
        });
        return txns.map((t :any)=> ({
            time: t.startTime,
            amount: t.amount,
            status: t.status,
            provider: t.provider
        }));
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

export default async function() {
    const balance = await getBalance();
    const transactions = await getOnRampTransactions();

    return <div className="w-full">
        <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
            Transfer
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
            <div>
                <AddMoney />
            </div>
            <div>
                <BalanceCard2 amount={balance.amount} locked={balance.locked} />
                <div className="pt-4">
                    <OnRampTransactions transactions={transactions} />
                </div>
            </div>
        </div>
    </div>
}