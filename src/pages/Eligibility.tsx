import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Filter, ArrowUpDown, Info, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { fetchDistricts, checkEligibility, EligibilityResponse, EligibilityResult } from "@/lib/api";
import { saveLastSearch, getLastSearch, saveProfile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { FormSkeleton, TableRowSkeleton } from "@/components/LoadingSkeleton";
import { toast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const formSchema = z.object({
  z_score: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 4;
  }, "Z-score must be between 0 and 4"),
  district_id: z.string().min(1, "Please select a district"),
  year: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Eligibility() {
  const { t, language } = useLanguage();
  const [results, setResults] = useState<EligibilityResponse | null>(null);
  const [sortBy, setSortBy] = useState<"cutoff" | "university">("cutoff");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterUniversity, setFilterUniversity] = useState("");

  const lastSearch = getLastSearch();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      z_score: lastSearch?.z_score?.toString() || "",
      district_id: lastSearch?.district_id?.toString() || "",
      year: lastSearch?.year?.toString() || "",
    },
  });

  // Fetch districts
  const { data: districts, isLoading: districtsLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: fetchDistricts,
  });

  // Check eligibility mutation
  const eligibilityMutation = useMutation({
    mutationFn: checkEligibility,
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Results loaded",
        description: `Found ${data.total_eligible} eligible courses`,
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : "Failed to check eligibility",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const district = districts?.find((d) => d.id === parseInt(data.district_id));
    const requestData = {
      z_score: parseFloat(data.z_score),
      district_id: parseInt(data.district_id),
      district: district?.name,
      year: data.year ? parseInt(data.year) : undefined,
      language,
    };

    // Save to localStorage
    saveLastSearch(requestData);
    saveProfile({
      z_score: requestData.z_score,
      district_id: requestData.district_id,
      district: requestData.district,
    });

    eligibilityMutation.mutate(requestData);
  };

  // Group and sort results
  const groupedResults = results?.results.reduce((acc, result) => {
    if (!acc[result.university]) {
      acc[result.university] = [];
    }
    acc[result.university].push(result);
    return acc;
  }, {} as Record<string, EligibilityResult[]>) || {};

  const sortedUniversities = Object.keys(groupedResults)
    .filter((uni) => uni.toLowerCase().includes(filterUniversity.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "university") {
        return sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a);
      }
      const aMax = Math.max(...groupedResults[a].map((r) => r.cutoff_score));
      const bMax = Math.max(...groupedResults[b].map((r) => r.cutoff_score));
      return sortOrder === "asc" ? aMax - bMax : bMax - aMax;
    });

  const years = [2024, 2023, 2022, 2021, 2020];

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <div className="container mx-auto px-4 py-24 sm:py-32 max-w-6xl flex-1">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* Form Card */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="border-0 shadow-medium overflow-hidden">
              <CardHeader className="bg-primary/5 border-b pb-6">
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                    <Search className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span>{t("eligibility.title")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {districtsLoading ? (
                  <FormSkeleton />
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="z_score"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("eligibility.zscore")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.0001"
                                min="0"
                                max="4"
                                placeholder={t("eligibility.zscorePlaceholder")}
                                className="h-12 rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="district_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("eligibility.district")}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl">
                                  <SelectValue placeholder={t("eligibility.selectDistrict")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {districts?.map((district) => (
                                  <SelectItem key={district.id} value={district.id.toString()}>
                                    {language === "si" && district.name_si
                                      ? district.name_si
                                      : language === "ta" && district.name_ta
                                      ? district.name_ta
                                      : district.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("eligibility.year")}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl">
                                  <SelectValue placeholder={t("eligibility.selectYear")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {years.map((year) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full h-12 rounded-full text-base font-medium"
                        disabled={eligibilityMutation.isPending}
                      >
                        {eligibilityMutation.isPending
                          ? t("eligibility.checking")
                          : t("eligibility.submit")}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {eligibilityMutation.isPending && (
              <Card className="border-0 shadow-soft">
                <CardContent className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <TableRowSkeleton key={i} />
                  ))}
                </CardContent>
              </Card>
            )}

            {results && (
              <>
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card rounded-2xl p-4 shadow-soft">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("eligibility.resultsFor")} {results.year}
                    </p>
                    <p className="text-lg font-semibold">
                      {t("eligibility.eligibleFor")}{" "}
                      <span className="text-primary">{results.total_eligible}</span>{" "}
                      {t("eligibility.courses")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Filter universities..."
                        value={filterUniversity}
                        onChange={(e) => setFilterUniversity(e.target.value)}
                        className="pl-9 h-10 rounded-xl w-48"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => {
                        if (sortBy === "cutoff") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("cutoff");
                          setSortOrder("desc");
                        }
                      }}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-1" />
                      {t("eligibility.cutoff")}
                    </Button>
                  </div>
                </div>

                {/* Results List */}
                {sortedUniversities.length === 0 ? (
                  <Card className="border-0 shadow-soft">
                    <CardContent className="p-12 text-center">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Info className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{t("eligibility.noResults")}</h3>
                      <p className="text-muted-foreground text-sm">{t("eligibility.noResultsHint")}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {sortedUniversities.map((university) => (
                      <Collapsible key={university} defaultOpen>
                        <Card className="border-0 shadow-soft overflow-hidden">
                          <CollapsibleTrigger className="w-full">
                            <CardHeader className="hover:bg-secondary/50 transition-colors cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                    {university.charAt(0)}
                                  </div>
                                  <div className="text-left">
                                    <CardTitle className="text-base">{university}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                      {groupedResults[university].length} courses
                                    </p>
                                  </div>
                                </div>
                                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                {groupedResults[university]
                                  .sort((a, b) => b.cutoff_score - a.cutoff_score)
                                  .map((course, idx) => (
                                    <div
                                      key={`${course.course_code}-${idx}`}
                                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{course.course}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {course.course_code}
                                          {course.faculty && ` • ${course.faculty}`}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Badge variant="secondary" className="rounded-full font-mono">
                                          {course.cutoff_score.toFixed(4)}
                                        </Badge>
                                        <Check className="h-4 w-4 text-success" />
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </>
            )}

            {!results && !eligibilityMutation.isPending && (
              <Card className="border-0 shadow-soft">
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Enter your details</h3>
                  <p className="text-muted-foreground text-sm">
                    Fill in the form on the left to check which courses you're eligible for.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
