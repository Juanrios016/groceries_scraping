import Product from "@/lib/models/product.models";
import { connectToDB } from "@/lib/mongoose"
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { getAveragePrice, getEmailNotifType, getHighestPrice, getLowestPrice } from "@/lib/utils";
import { NextResponse } from "next/server";

export const maxDuration = 280;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        await connectToDB();

        // fetching all products

        const products = await Product.find({});

        if(!products) throw new Error(`No product found.`)

        // Scraping product and updating DB
        const updatedProducts = await Promise.all(
            products.map(async (current) => {
                const scrapedProduct = await scrapeAmazonProduct(current.url);

                if (!scrapedProduct) throw new Error(`No Product Found`);

                const updatedPriceHistory = [
                        ...current.priceHistory,
                        { price: scrapedProduct.currentPrice }
                    ]
        
                    const product = { 
                        ...scrapedProduct,
                        priceHistory: updatedPriceHistory,
                        lowestPrice: getLowestPrice(updatedPriceHistory),
                        highestPrice: getHighestPrice(updatedPriceHistory),
                        averagePrice: getAveragePrice(updatedPriceHistory),
        
                    }
                
                    const updatedProduct = await Product.findOneAndUpdate( 
                        { url: product.url },
                        product, 
                    );


            // check product status and send automated email
                const emailNotification = getEmailNotifType(scrapedProduct, current)

                if(emailNotification && updatedProduct.users.length > 0) {

                    const productInfo = {
                        title:updatedProduct.title,
                        url: updatedProduct.url,
                    };

                    const emailContent = await generateEmailBody(productInfo, emailNotification);

                    const userEmails = updatedProduct.users.map((user: any) => user.email);
                
                    await sendEmail(emailContent, userEmails);
                }
                return updatedProduct;
            })
        )

        return NextResponse.json({
            message: 'Ok', data: updatedProducts
        })
    } catch (error) {
        throw new Error(`Error in GET: ${error}`);
    }
}