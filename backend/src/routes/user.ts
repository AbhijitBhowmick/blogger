import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { use } from "hono/jsx";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    };
}>();

userRouter.post('/api/v1/signup', async (c) => {
const prisma = new PrismaClient({
	datasourceUrl: c.env.DATABASE_URL // This should be set in your environment variables
}).$extends(withAccelerate())

	const body = await 	c.req.json	();

	try {

	const user = await prisma.user.create({
		data: {
			email: body.email,
			password: body.password
		},
	})
	const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

	return c.json({jwt});
} catch (error) {
	c.status(403);
	return c.json({ error: 'Error while signing up' });
}
	return c.text('signup route')
})

userRouter.post('/api/v1/signin', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL // This should be set in your environment variables
    }).$extends(withAccelerate())

    const body = await c.req.json();

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
                password: body.password
            }
        });

        if (!user) {
            c.status(403);
            return c.json({ error: 'Invalid email or password' });
        }

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt });
    } catch (error) {
        c.status(500);
        return c.json({ error: 'Error while signing in' });
    }
}); 