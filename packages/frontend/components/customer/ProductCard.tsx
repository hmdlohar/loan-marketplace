import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NextLink from "next/link";
import { getFileProxyUrl } from "../../services/fileProxyUtil";
import { loanProductLabels } from "../../services/customerUtil";
import { trustShadowSx } from "../../theme/styleHelpers";

type ProductCardProps = {
  product: {
    _id: string;
    Title: string;
    Slug: string;
    ShortDescription: string;
    LoanType: string;
    KeyBenefits?: string[];
    Bank?: {
      Name?: string;
      LogoPath?: string;
    } | null;
  };
  href?: string;
};

export default function ProductCard(props: ProductCardProps) {
  const href = props.href || `/app/products/${props.product.Slug}`;
  const bankName = props.product.Bank?.Name || "Partner bank";
  const logoUrl = props.product.Bank?.LogoPath ? getFileProxyUrl(props.product.Bank.LogoPath) : "";

  return (
    <Card
      sx={(theme) => ({
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
        "&:hover": trustShadowSx(theme),
      })}
    >
      <CardActionArea component={NextLink} href={href} sx={{ height: "100%", alignItems: "stretch" }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, height: "100%" }}>
          <Stack spacing={2.5} sx={{ height: "100%" }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={logoUrl}
                alt={bankName}
                variant="rounded"
                sx={{ width: 52, height: 52, bgcolor: "background.default" }}
              >
                {bankName.charAt(0)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                  {bankName}
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                  {props.product.Title}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {props.product.ShortDescription}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={loanProductLabels[props.product.LoanType] || props.product.LoanType} color="secondary" variant="outlined" />
              {(props.product.KeyBenefits || []).slice(0, 1).map((benefit) => (
                <Chip key={benefit} size="small" label={benefit} variant="outlined" />
              ))}
            </Stack>

            <Button endIcon={<ArrowForwardIcon />} sx={{ alignSelf: "flex-start", mt: "auto" }}>
              View details
            </Button>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
